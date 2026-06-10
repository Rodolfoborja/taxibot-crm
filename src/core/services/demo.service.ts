import prisma from '@/lib/prisma'

/**
 * Inserta datos de demostración realistas (Guayaquil) para revisar el panel:
 * conductores con GPS, carreras activas con trayectoria, incidentes, pagos y mensajes.
 * Idempotente: limpia los datos demo previos (teléfonos con prefijo +593990) y recrea.
 */

const DEMO_PREFIX = '+593990'
const CENTRO = { lat: -2.170998, lng: -79.922359 } // Guayaquil

function jitter(base: number, max = 0.03) {
  // determinista-ish a partir de un índice no es necesario; usamos pequeño offset pseudo
  return base + (Math.random() - 0.5) * 2 * max
}

/** Genera una trayectoria de N puntos interpolando de origen a destino con leve ruido. */
function generarRuta(
  origen: { lat: number; lng: number },
  destino: { lat: number; lng: number },
  n: number
) {
  const puntos: { lat: number; lng: number }[] = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    puntos.push({
      lat: origen.lat + (destino.lat - origen.lat) * t + (Math.random() - 0.5) * 0.001,
      lng: origen.lng + (destino.lng - origen.lng) * t + (Math.random() - 0.5) * 0.001,
    })
  }
  return puntos
}

export async function limpiarDemo() {
  const demoUsers = await prisma.usuario.findMany({
    where: { telefono: { startsWith: DEMO_PREFIX } },
    select: { id: true },
  })
  const userIds = demoUsers.map((u) => u.id)
  if (userIds.length === 0) return

  const carreras = await prisma.carrera.findMany({
    where: { OR: [{ usuarioId: { in: userIds } }, { conductorId: { in: userIds } }] },
    select: { id: true },
  })
  const carreraIds = carreras.map((c) => c.id)

  await prisma.mensaje.deleteMany({
    where: { OR: [{ telefono: { startsWith: DEMO_PREFIX } }, { carreraId: { in: carreraIds } }] },
  })
  await prisma.ubicacionHistorial.deleteMany({ where: { carreraId: { in: carreraIds } } })
  await prisma.incidente.deleteMany({
    where: { OR: [{ carreraId: { in: carreraIds } }, { usuarioId: { in: userIds } }] },
  })
  await prisma.pago.deleteMany({
    where: { OR: [{ carreraId: { in: carreraIds } }, { usuarioId: { in: userIds } }] },
  })
  await prisma.calificacion.deleteMany({ where: { carreraId: { in: carreraIds } } })
  await prisma.carrera.deleteMany({ where: { id: { in: carreraIds } } })
  await prisma.usuario.deleteMany({ where: { id: { in: userIds } } }) // cascada: datoConductor, ubicaciones, sanciones
}

export async function seedDemo() {
  await limpiarDemo()

  // ---- Conductores ----
  const defsConductores = [
    { nombre: 'Carlos Mendoza', placa: 'GUA-1234', estado: 'APROBADO', disponible: true, rating: 4.8 },
    { nombre: 'Luis Paredes', placa: 'GBA-5678', estado: 'APROBADO', disponible: false, rating: 4.5 },
    { nombre: 'Andrés Vera', placa: 'GYE-9012', estado: 'APROBADO', disponible: true, rating: 4.9 },
    { nombre: 'Jorge Castro', placa: 'GUA-3456', estado: 'APROBADO', disponible: false, rating: 4.2 },
    { nombre: 'Pedro Salazar', placa: 'GBA-7890', estado: 'PENDIENTE', disponible: false, rating: 0 },
    { nombre: 'Miguel Torres', placa: 'GYE-2468', estado: 'SUSPENDIDO', disponible: false, rating: 3.1 },
  ]

  const conductores = []
  for (let i = 0; i < defsConductores.length; i++) {
    const d = defsConductores[i]
    const telefono = `${DEMO_PREFIX}1${String(i).padStart(2, '0')}`
    const usuario = await prisma.usuario.create({
      data: {
        telefono,
        nombre: d.nombre,
        tipo: 'CONDUCTOR',
        datoConductor: {
          create: {
            cedula: `09${String(10000000 + i)}`,
            licencia: `LIC-${1000 + i}`,
            placa: d.placa,
            estado: d.estado as never,
            disponible: d.disponible,
            gpsActivo: d.estado === 'APROBADO',
            ratingPromedio: d.rating,
            totalViajes: Math.floor(Math.random() * 400),
            ubicacionLat: d.estado === 'APROBADO' ? jitter(CENTRO.lat) : null,
            ubicacionLng: d.estado === 'APROBADO' ? jitter(CENTRO.lng) : null,
            ubicacionTimestamp: d.estado === 'APROBADO' ? new Date() : null,
          },
        },
      },
      include: { datoConductor: true },
    })
    conductores.push(usuario)
  }

  // ---- Clientes ----
  const nombresClientes = ['María López', 'Ana Ríos', 'José Pérez', 'Lucía Vargas', 'Diego Sánchez', 'Sofía Ramos', 'Tomás Aguirre', 'Valeria Núñez']
  const clientes = []
  for (let i = 0; i < nombresClientes.length; i++) {
    const cliente = await prisma.usuario.create({
      data: {
        telefono: `${DEMO_PREFIX}2${String(i).padStart(2, '0')}`,
        nombre: nombresClientes[i],
        tipo: 'CLIENTE',
        bloqueado: i === 7, // uno bloqueado
        deudaPendiente: i === 6 ? 4.5 : 0,
      },
    })
    clientes.push(cliente)
  }

  const aprobados = conductores.filter((c) => c.datoConductor?.estado === 'APROBADO')

  // ---- Carreras ----
  let carrerasActivas = 0
  const destinos = [
    { lat: -2.1462, lng: -79.8896, dir: 'Mall del Sol' },
    { lat: -2.1894, lng: -79.8891, dir: 'Las Peñas' },
    { lat: -2.1510, lng: -79.9000, dir: 'Urdesa Central' },
    { lat: -2.2030, lng: -79.8975, dir: 'Puerto Santa Ana' },
  ]

  for (let i = 0; i < 10; i++) {
    const cliente = clientes[i % clientes.length]
    const conductor = aprobados[i % aprobados.length]
    const destino = destinos[i % destinos.length]
    const origen = { lat: jitter(CENTRO.lat), lng: jitter(CENTRO.lng) }
    const distancia = 3 + Math.random() * 8
    const costo = +(1.5 + distancia * 0.45).toFixed(2)

    // 3 activas (EN_CURSO), 1 ASIGNADA, 1 BUSCANDO, 1 CANCELADA, resto COMPLETADA
    let estado: string
    if (i < 3) estado = 'EN_CURSO'
    else if (i === 3) estado = 'ASIGNADA'
    else if (i === 4) estado = 'BUSCANDO'
    else if (i === 5) estado = 'CANCELADA'
    else estado = 'COMPLETADA'

    const esActiva = ['EN_CURSO', 'ASIGNADA'].includes(estado)
    const asignada = estado !== 'BUSCANDO'

    const carrera = await prisma.carrera.create({
      data: {
        usuarioId: cliente.id,
        conductorId: asignada ? conductor.id : null,
        origenLat: origen.lat,
        origenLng: origen.lng,
        origenDireccion: `Calle ${100 + i} y Av. Principal`,
        destinoLat: destino.lat,
        destinoLng: destino.lng,
        destinoDireccion: destino.dir,
        distanciaKm: +distancia.toFixed(2),
        costoEstimado: costo,
        costoFinal: estado === 'COMPLETADA' ? costo : null,
        estado: estado as never,
        pagado: estado === 'COMPLETADA',
        fechaAsignacion: asignada ? new Date(Date.now() - 30 * 60000) : null,
        fechaInicio: esActiva || estado === 'COMPLETADA' ? new Date(Date.now() - 20 * 60000) : null,
        fechaFin: estado === 'COMPLETADA' ? new Date(Date.now() - 5 * 60000) : null,
      },
    })

    // Trayectoria para carreras activas
    if (esActiva && conductor.datoConductor) {
      carrerasActivas++
      const ruta = generarRuta(origen, destino, 25)
      const recorrido = estado === 'EN_CURSO' ? Math.floor(ruta.length * 0.6) : 3
      const ahora = Date.now()
      await prisma.ubicacionHistorial.createMany({
        data: ruta.slice(0, recorrido).map((p, idx) => ({
          conductorId: conductor.datoConductor!.id,
          carreraId: carrera.id,
          lat: p.lat,
          lng: p.lng,
          timestamp: new Date(ahora - (recorrido - idx) * 30000),
        })),
      })
      // Posición actual del conductor = último punto de la ruta
      const ultimo = ruta[recorrido - 1]
      await prisma.datoConductor.update({
        where: { id: conductor.datoConductor.id },
        data: { ubicacionLat: ultimo.lat, ubicacionLng: ultimo.lng, ubicacionTimestamp: new Date() },
      })
    }

    // Pagos para completadas
    if (estado === 'COMPLETADA') {
      await prisma.pago.create({
        data: {
          carreraId: carrera.id,
          usuarioId: cliente.id,
          monto: costo,
          metodo: 'TARJETA',
          estado: 'EXITOSO',
          fechaConfirmacion: new Date(Date.now() - 4 * 60000),
        },
      })
    }

    // Mensajes demo en una carrera activa
    if (i === 0) {
      await prisma.mensaje.createMany({
        data: [
          { carreraId: carrera.id, telefono: cliente.telefono, nombre: cliente.nombre, direccion: 'ENTRANTE', texto: '¿Cuánto falta para que llegue?', estado: 'ENTREGADO', timestamp: new Date(Date.now() - 6 * 60000) },
          { carreraId: carrera.id, telefono: cliente.telefono, nombre: cliente.nombre, direccion: 'SALIENTE', texto: 'Tu conductor está a 5 minutos.', estado: 'ENVIADO', timestamp: new Date(Date.now() - 5 * 60000) },
        ],
      })
    }
  }

  // ---- Carreras BUSCANDO (sin conductor) para el tablero de Despacho ----
  let carrerasBuscando = 0
  for (let k = 0; k < 3; k++) {
    const cliente = clientes[(k + 2) % clientes.length]
    const destino = destinos[k % destinos.length]
    const origen = { lat: jitter(CENTRO.lat), lng: jitter(CENTRO.lng) }
    const distancia = 2 + Math.random() * 6
    await prisma.carrera.create({
      data: {
        usuarioId: cliente.id,
        conductorId: null,
        origenLat: origen.lat,
        origenLng: origen.lng,
        origenDireccion: `Av. ${k + 1} de Mayo y Calle ${20 + k}`,
        destinoLat: destino.lat,
        destinoLng: destino.lng,
        destinoDireccion: destino.dir,
        distanciaKm: +distancia.toFixed(2),
        costoEstimado: +(1.5 + distancia * 0.45).toFixed(2),
        estado: 'BUSCANDO',
        fechaSolicitud: new Date(Date.now() - (k + 1) * 120000),
      },
    })
    carrerasBuscando++
  }

  // ---- Mensajes de soporte ENTRANTES (ayuda / info) sin responder ----
  const soporteMsgs = [
    { i: 2, texto: '¿Tienen servicio hasta Samborondón?' },
    { i: 3, texto: 'Necesito ayuda, el conductor no ha llegado y ya esperé 20 min.' },
    { i: 5, texto: '¿Cuánto cuesta del centro al aeropuerto?' },
  ]
  for (const sm of soporteMsgs) {
    const cliente = clientes[sm.i]
    await prisma.mensaje.create({
      data: {
        telefono: cliente.telefono,
        nombre: cliente.nombre,
        direccion: 'ENTRANTE',
        texto: sm.texto,
        estado: 'ENTREGADO',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 + 1) * 60000),
      },
    })
  }

  // ---- Incidentes ----
  const carrerasParaIncidente = await prisma.carrera.findMany({
    where: { usuarioId: { in: clientes.map((c) => c.id) } },
    take: 2,
  })
  if (carrerasParaIncidente[0]) {
    await prisma.incidente.create({
      data: {
        carreraId: carrerasParaIncidente[0].id,
        usuarioId: clientes[0].id,
        tipo: 'EMERGENCIA',
        descripcion: 'El cliente activó el botón de pánico durante el viaje.',
        estado: 'ABIERTO',
      },
    })
  }
  if (carrerasParaIncidente[1]) {
    await prisma.incidente.create({
      data: {
        carreraId: carrerasParaIncidente[1].id,
        usuarioId: clientes[1].id,
        tipo: 'COBRO_INDEBIDO',
        descripcion: 'El conductor cobró más de lo estimado.',
        estado: 'EN_REVISION',
      },
    })
  }

  return {
    conductores: conductores.length,
    clientes: clientes.length,
    carrerasActivas,
    carrerasBuscando,
    mensaje: 'Datos de demo insertados.',
  }
}
