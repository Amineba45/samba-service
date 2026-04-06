import Link from 'next/link'
import { ShoppingCart, MapPin, Zap, Shield } from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'Localisation GPS',
    description: 'Trouvez les magasins les plus proches de vous automatiquement'
  },
  {
    icon: Zap,
    title: 'Livraison rapide',
    description: 'Recevez vos courses en moins de 60 minutes'
  },
  {
    icon: ShoppingCart,
    title: 'Multi-magasins',
    description: 'Commandez dans plusieurs supermarchés en même temps'
  },
  {
    icon: Shield,
    title: 'Paiement sécurisé',
    description: 'Orange Money, Wave et paiement à la livraison'
  }
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Samba Service
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-primary-100">
              Vos courses à domicile à Dakar
            </p>
            <p className="text-lg mb-10 text-primary-200 max-w-2xl mx-auto">
              Commandez en ligne dans vos supermarchés préférés et recevez vos courses
              directement chez vous en moins d&apos;une heure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/stores"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
              >
                Voir les magasins
              </Link>
              <Link
                href="/register"
                className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-400 transition-colors border border-primary-400"
              >
                S&apos;inscrire gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir Samba Service ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <feature.icon className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Nos magasins partenaires
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Découvrez nos supermarchés à Dakar
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'SAMBA BA - Keur Massar', address: 'À côté du pont, devant la pharmacie', area: 'Keur Massar' },
              { name: 'SAMBA BA - Almadies 2', address: 'Almadies 2', area: 'Almadies' },
              { name: 'Supérette Rahmatoulah', address: 'Devant la Gendarmerie', area: 'Keur Massar' },
              { name: 'SUPERETTE ISB SAMBA BA', address: 'Route du Tivaouane Peulh, devant l\'église', area: 'Tivaouane Peulh' }
            ].map((store, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{store.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{store.address}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                      {store.area}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/stores"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Voir tous les magasins
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Samba Service</h3>
            <p className="text-gray-400 mb-8">
              La plateforme e-commerce des supermarchés de Dakar
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-400">
              <Link href="/about" className="hover:text-white transition-colors">À propos</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            </div>
            <p className="text-gray-500 text-sm mt-8">
              © {new Date().getFullYear()} Samba Service. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
