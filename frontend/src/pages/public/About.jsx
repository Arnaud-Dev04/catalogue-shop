import React from 'react';
import { Target, Eye, Leaf, TrendingUp, CircleDollarSign, Users, Tractor, Sprout, Truck, ShieldCheck } from 'lucide-react';

function About() {
  const objectives = [
    {
      title: "Produire des aliments de qualité",
      desc: "Développer des aliments équilibrés et adaptés aux différentes étapes de croissance et de production des volailles afin d'améliorer leurs performances.",
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Améliorer la productivité des éleveurs",
      desc: "Permettre aux éleveurs d’obtenir une meilleure croissance des poulets, une meilleure production d’œufs et une meilleure santé des volailles.",
      icon: <TrendingUp className="w-6 h-6 text-green-600" />
    },
    {
      title: "Rendre les aliments accessibles",
      desc: "Proposer des aliments de qualité à des prix compétitifs afin de permettre aux petits, moyens et grands éleveurs d’améliorer leurs activités.",
      icon: <CircleDollarSign className="w-6 h-6 text-amber-600" />
    },
    {
      title: "Valoriser les matières premières locales",
      desc: "Utiliser autant que possible des matières premières produites localement (maïs, sous-produits céréaliers) disponibles au Burundi.",
      icon: <Leaf className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Soutenir le développement de l’aviculture",
      desc: "Contribuer à la modernisation de l’élevage avicole et à l’augmentation de la production de viande et d’œufs au Burundi.",
      icon: <Tractor className="w-6 h-6 text-orange-600" />
    },
    {
      title: "Créer des emplois",
      desc: "Créer des emplois directs et indirects, notamment pour les jeunes, tout au long de la chaîne de production, d’approvisionnement et de distribution.",
      icon: <Users className="w-6 h-6 text-purple-600" />
    },
    {
      title: "Promouvoir une agriculture durable",
      desc: "Favoriser l'intégration entre l’agriculture et l’élevage en créant une demande locale et en encourageant la valorisation des ressources disponibles.",
      icon: <Sprout className="w-6 h-6 text-teal-600" />
    },
    {
      title: "Développer un réseau de distribution",
      desc: "Établir progressivement un réseau de distribution pour un accès facile à nos produits à Gitega et dans les autres provinces du Burundi.",
      icon: <Truck className="w-6 h-6 text-indigo-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* ── HEADER (HERO) ── */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold rounded-full mb-6 tracking-wider uppercase">
            Clopofeco
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Clovis's Poultry Feeding Company
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Devenir un acteur majeur de l’industrie de l’alimentation animale dans la région des Grands Lacs, en fournissant des solutions nutritionnelles fiables.
          </p>
        </div>
      </section>

      {/* ── VISION & MISSION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Vision</h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              Devenir une entreprise de référence au Burundi dans la production d’aliments de qualité pour volailles, en contribuant à une aviculture moderne, productive, rentable et durable.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              Produire et commercialiser des aliments équilibrés, nutritifs, sûrs et accessibles pour les volailles, afin d’améliorer leur croissance, santé et productivité tout en augmentant la rentabilité des éleveurs.
            </p>
          </div>
        </div>
      </section>

      {/* ── OBJECTIFS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Nos 8 Objectifs Principaux</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Nous travaillons à valoriser les ressources locales et à développer des solutions adaptées aux poussins, poulets de chair et poules pondeuses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {objectives.map((obj, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                {obj.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{obj.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{obj.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ENGAGEMENT ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-24">
        <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl shadow-green-900/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Notre Engagement</h2>
          <p className="text-lg md:text-xl font-medium leading-relaxed mb-6 opacity-95">
            "Chez Clovis's Poultry Feeding Company, nous croyons qu’une bonne alimentation est la base d’une volaille saine, productive et rentable."
          </p>
          <p className="text-green-100/80 leading-relaxed max-w-2xl mx-auto">
            Notre engagement est donc de fournir aux éleveurs des aliments fiables et de qualité, tout en construisant une entreprise qui contribue au développement de l’agriculture, à la création d’emplois et à la sécurité alimentaire au Burundi.
          </p>
        </div>
      </section>

    </div>
  );
}

export default About;
