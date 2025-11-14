import Link from "next/link"
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  const navigation = {
    produit: [
      { name: "Fonctionnalités", href: "#fonctionnalites" },
      { name: "Tarifs", href: "#tarifs" },
      { name: "Démo", href: "#demo" },
      { name: "Mises à jour", href: "/updates" },
    ],
    entreprise: [
      { name: "À propos", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Carrières", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    ressources: [
      { name: "Documentation", href: "/docs" },
      { name: "Guides", href: "/guides" },
      { name: "Support", href: "/support" },
      { name: "API", href: "/api" },
    ],
    legal: [
      { name: "Politique de confidentialité", href: "/politique-confidentialite" },
      { name: "CGU", href: "/cgu" },
      { name: "CGV", href: "/cgv" },
      { name: "Mentions légales", href: "/mentions-legales" },
      { name: "Remboursement", href: "/politique-remboursement" },
    ],
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              Trajectory
            </Link>
            <p className="text-sm text-gray-400 mb-6">
              Pilotez votre croissance financière avec simplicité et efficacité.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@trajectory.fr"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-3">
              {navigation.produit.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {navigation.entreprise.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Ressources</h3>
            <ul className="space-y-3">
              {navigation.ressources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} Trajectory. Tous droits réservés.
          </p>
          <p className="text-sm text-gray-400">
            Fait avec ❤️ en France
          </p>
        </div>
      </div>
    </footer>
  )
}
