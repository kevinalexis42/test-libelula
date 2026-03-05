import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>Plataforma Insurtech</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Cotización y Emisión de Pólizas
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Obtén una cotización de seguro en segundos. Compara coberturas y emite tu póliza de forma
          instantánea.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/quote"
            className="btn-primary px-6 py-3 text-base"
          >
            Solicitar Cotización
          </Link>
          <Link
            href="/login"
            className="btn-secondary px-6 py-3 text-base"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      {/* Flow steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="card text-center">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-teal-600 font-bold text-xl">1</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Ingresa tus datos</h3>
          <p className="text-gray-500 text-sm">
            Selecciona el tipo de seguro, cobertura, tu edad y ubicación.
          </p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-teal-600 font-bold text-xl">2</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Recibe tu cotización</h3>
          <p className="text-gray-500 text-sm">
            Obtén tu prima estimada con un desglose detallado del cálculo.
          </p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-teal-600 font-bold text-xl">3</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Emite tu póliza</h3>
          <p className="text-gray-500 text-sm">
            Confirma la cotización y emite tu póliza de forma inmediata.
          </p>
        </div>
      </div>

      {/* Insurance types */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Tipos de Seguro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              code: 'AUTO',
              name: 'Seguro de Auto',
              icon: '🚗',
              desc: 'Protege tu vehículo ante accidentes, robo y daños.',
            },
            {
              code: 'SALUD',
              name: 'Seguro de Salud',
              icon: '❤️',
              desc: 'Cobertura médica completa para ti y tu familia.',
            },
            {
              code: 'HOGAR',
              name: 'Seguro de Hogar',
              icon: '🏠',
              desc: 'Protege tu hogar ante incendios, robos y desastres.',
            },
          ].map((type) => (
            <Link
              key={type.code}
              href={`/quote?insuranceType=${type.code}`}
              className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:bg-teal-50 transition-all group"
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">{type.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{type.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
