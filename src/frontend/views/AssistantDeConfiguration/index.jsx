import React, { useState } from "react";
import Logo from "../../assets/icons/school-manager-logo.svg";

// Icônes pour chaque étape (vous pouvez remplacer par de vraies icônes SVG)
const StepIcon = ({ step }) => {
  const icons = {
    1: "👋",
    2: "📊",
    3: "🔄",
    4: "🚀",
  };
  return <div className="text-6xl mb-6">{icons[step]}</div>;
};

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    const content = {
      1: {
        title: "Bienvenue sur School Manager",
        text: "L'outil nouvelle génération pour une administration scolaire fluide, intuitive et entièrement numérique.",
      },
      2: {
        title: "Une Centralisation Puissante",
        text: "Gérez les inscriptions, les notes, les emplois du temps et la génération automatique des bulletins scolaires.",
      },
      3: {
        title: "Migration Simplifiée",
        text: "Gagnez un temps précieux en important vos données existantes en un clic, y compris depuis des plateformes comme EducMaster.",
      },
      4: {
        title: "Vous êtes prêt !",
        text: "Cliquez sur 'Terminer' pour configurer votre établissement et lancer l'application.",
      },
    };

    const { title, text } = content[step];

    return (
      <div key={step} className="animate-fade-in">
        <StepIcon step={step} />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 max-w-md mx-auto">{text}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="w-full max-w-2xl p-10 mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl text-center transition-all duration-500">
        <img src={Logo} alt="Logo" className="w-20 h-20 mx-auto mb-4" />

        {renderStepContent()}

        <div className="flex justify-between items-center mt-10">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-transform transform hover:scale-105"
            >
              Précédent
            </button>
          ) : (
            <div className="w-24" />
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg"
            >
              Terminer
            </button>
          )}
        </div>

        <div className="flex justify-center mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 mx-1.5 rounded-full transition-all duration-300 ${step >= i ? "bg-blue-600 scale-125" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
       <p className="text-center text-xs text-gray-500 mt-4">
        School Management App © 2025
      </p>
    </div>
  );
};

export default Onboarding;
