import React, { useState } from 'react';
import './App.css';

// Componenti icone semplificati
const ChevronDown = () => <span>▼</span>;
const ChevronUp = () => <span>▲</span>;
const Clock = () => <span>⏰</span>;
const Target = () => <span>🎯</span>;
const AlertCircle = () => <span>⚠️</span>;
const CheckCircle = () => <span>✅</span>;
const Settings = () => <span>⚙️</span>;
const User = () => <span>👤</span>;

const WorkoutInterface = () => {
  const [userIssues, setUserIssues] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [workoutData, setWorkoutData] = useState(null);
  const [jsonInput, setJsonInput] = useState('');

  const [expandedSections, setExpandedSections] = useState({});
  const [completedExercises, setCompletedExercises] = useState({});

  // Funzione per caricare JSON
  const loadWorkoutFromJson = () => {
    try {
      const data = JSON.parse(jsonInput);
      setWorkoutData(data);
      
      // Apri tutte le sezioni automaticamente
      const sections = {};
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          sections[key] = true;
        }
      });
      setExpandedSections(sections);
      
      alert('Programma caricato con successo!');
    } catch (error) {
      alert('Errore nel JSON! Controlla la sintassi.');
    }
  };

  const getBestOptionForUser = (exercise) => {
    const hasConflict = exercise.contraindicated_for?.some(issue => userIssues.includes(issue));
    if (hasConflict) {
      const physioOption = exercise.options.find(opt => opt.type === 'physio');
      if (physioOption) return physioOption;
      const easyOption = exercise.options.find(opt => opt.type === 'alternative_easy');
      if (easyOption) return easyOption;
    }
    return exercise.options?.[0] || { type: 'standard', description: 'Nessuna variante disponibile' };
  };

  const getSectionTitle = (sectionKey) => {
    const titles = {
      mobilita_risveglio: "🌅 Mobilità di risveglio",
      riscaldamento: "🔥 Riscaldamento",
      fase1: "💪 Fase 1 - Forza",
      fase2: "⚡ Fase 2 - Resistenza", 
      fase3: "🎯 Fase 3 - Core",
      fase4: "🧘 Fase 4 - Defaticamento"
    };
    return titles[sectionKey] || sectionKey;
  };

  const toggleExerciseCompletion = (sectionKey, exerciseIndex) => {
    const key = `${sectionKey}-${exerciseIndex}`;
    setCompletedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const isCircuitExercise = (exercise) => {
    const circuitKeywords = ['EMOM', 'AMRAP', 'for time', 'tabata'];
    return circuitKeywords.some(keyword => 
      exercise.name.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Se non c'è workout data, mostra l'interfaccia di caricamento
  if (!workoutData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🏋️ Carica il Tuo Programma di Allenamento
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incolla qui il JSON generato dall'IA:
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"date": "2025-08-11", "goal": "forza", "mobilita_risveglio": [...], ...}'
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>
            
            <button
              onClick={loadWorkoutFromJson}
              disabled={!jsonInput.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              📋 Carica Programma
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">💡 Come usare:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Genera il programma con l'IA</li>
              <li>2. Copia il JSON generato</li>
              <li>3. Incollalo nell'area di testo sopra</li>
              <li>4. Clicca "Carica Programma"</li>
              <li>5. Il tuo allenamento personalizzato è pronto!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Interfaccia principale con workout caricato
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Programma Personalizzato
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {new Date(workoutData.date).toLocaleDateString('it-IT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center px-4 py-3 bg-blue-100 text-blue-800 rounded-xl font-medium">
              <Target /> <span className="ml-2 capitalize">Obiettivo: {workoutData.goal}</span>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Settings />
            </button>
            <button
              onClick={() => setWorkoutData(null)}
              className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-colors text-sm"
            >
              🔄 Nuovo
            </button>
          </div>
        </div>

        {/* Pannello impostazioni profilo */}
        {showSettings && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <User /> <h3 className="ml-2 font-bold text-gray-800">Il Tuo Profilo Fisico</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Seleziona eventuali problemi articolari:</p>
            <div className="flex flex-wrap gap-3">
              {['spalla', 'ginocchia', 'schiena', 'anca', 'polso', 'caviglia'].map(issue => (
                <label 
                  key={issue} 
                  className={`flex items-center cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                    userIssues.includes(issue)
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={userIssues.includes(issue)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUserIssues([...userIssues, issue]);
                      } else {
                        setUserIssues(userIssues.filter(i => i !== issue));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="capitalize font-medium">{issue}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sezioni workout */}
      <div className="space-y-6">
        {Object.entries(workoutData).map(([sectionKey, exercises]) => {
          if (!Array.isArray(exercises)) return null;
          
          const isExpanded = expandedSections[sectionKey];
          const completedCount = exercises.filter((_, index) => 
            completedExercises[`${sectionKey}-${index}`]
          ).length;
          
          return (
            <div key={sectionKey} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full p-6 text-left bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 transition-all border-b border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">{getSectionTitle(sectionKey)}</h2>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {exercises.length} esercizi
                      </span>
                      {completedCount > 0 && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {completedCount} completati
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                  {exercises.map((exercise, exerciseIndex) => {
                    const exerciseKey = `${sectionKey}-${exerciseIndex}`;
                    const isCompleted = completedExercises[exerciseKey];
                    const bestOption = getBestOptionForUser(exercise);
                    const hasUserConflict = exercise.contraindicated_for?.some(issue => userIssues.includes(issue));

                    if (isCircuitExercise(exercise)) {
                      // Visualizzazione circuito
                      const circuitExercises = bestOption.description.split(',').map(ex => ex.trim()).filter(ex => ex.length > 0);
                      
                      return (
                        <div key={exerciseIndex} className="rounded-xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-100 shadow-lg p-6 mb-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="text-3xl">⏰</div>
                                <div>
                                  <h4 className={`font-bold text-2xl ${isCompleted ? 'text-green-700 line-through' : 'text-purple-800'}`}>
                                    {exercise.name.toUpperCase()}
                                  </h4>
                                  <p className="text-purple-600 font-medium text-sm">{exercise.detail}</p>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => toggleExerciseCompletion(sectionKey, exerciseIndex)}
                              className={`p-4 rounded-full transition-all ${
                                isCompleted 
                                  ? 'bg-green-500 text-white scale-110' 
                                  : 'bg-white/80 text-purple-600 border-2 border-purple-300'
                              }`}
                            >
                              <CheckCircle />
                            </button>
                          </div>

                          <div className="bg-white/80 rounded-lg p-4 mb-4">
                            <h5 className="font-bold text-purple-800 mb-3">📋 Esercizi del circuito</h5>
                            <div className="space-y-2">
                              {circuitExercises.map((ex, idx) => (
                                <div key={idx} className="flex items-center p-2 bg-purple-100/50 rounded-lg">
                                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                    {idx + 1}
                                  </div>
                                  <span className="text-purple-800 font-medium capitalize">{ex}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {hasUserConflict && (
                            <div className="flex items-center p-3 bg-amber-200/80 border border-amber-400 rounded-lg mb-4">
                              <AlertCircle />
                              <span className="ml-2 text-sm text-amber-900 font-medium">
                                ⚠️ Circuito adattato per problemi a: {exercise.contraindicated_for.filter(issue => userIssues.includes(issue)).join(', ')}
                              </span>
                            </div>
                          )}

                          <div className="bg-white/60 rounded-lg p-3">
                            <p className="text-purple-700 text-sm leading-relaxed italic">{exercise.description}</p>
                          </div>
                        </div>
                      );
                    } else {
                      // Visualizzazione esercizio normale
                      return (
                        <div key={exerciseIndex} className={`rounded-lg border-l-4 p-4 mb-3 transition-all ${
                          isCompleted 
                            ? 'border-l-green-500 bg-green-50' 
                            : hasUserConflict
                              ? 'border-l-amber-500 bg-amber-50'
                              : 'border-l-blue-500 bg-white hover:shadow-md'
                        }`}>
                          
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className={`font-bold text-lg capitalize ${
                                  isCompleted ? 'text-green-700 line-through' : 'text-gray-800'
                                }`}>
                                  {exercise.name}
                                </h4>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-300">
                                  {bestOption.type === 'standard' ? 'Standard' : 
                                   bestOption.type === 'alternative_easy' ? 'Facilitato' : 
                                   bestOption.type === 'physio' ? 'Fisioterapico' : bestOption.type}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-700 mb-2">
                                <Clock />
                                <span className="ml-2 text-sm font-medium">{exercise.detail}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => toggleExerciseCompletion(sectionKey, exerciseIndex)}
                              className={`p-3 rounded-full transition-all ${
                                isCompleted 
                                  ? 'bg-green-500 text-white scale-110' 
                                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                              }`}
                            >
                              <CheckCircle />
                            </button>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-gray-700 text-sm">{bestOption.description}</p>
                          </div>

                          {hasUserConflict && (
                            <div className="flex items-center p-3 bg-amber-100 border border-amber-300 rounded-lg mb-3">
                              <AlertCircle />
                              <span className="ml-2 text-sm text-amber-800">
                                ⚠️ Variante adattata per problemi a: {exercise.contraindicated_for.filter(issue => userIssues.includes(issue)).join(', ')}
                              </span>
                            </div>
                          )}

                          <p className="text-gray-600 text-sm mt-3 italic">{exercise.description}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Riepilogo */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Riepilogo Sessione</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {Object.keys(workoutData).filter(key => Array.isArray(workoutData[key])).length}
            </div>
            <div className="text-blue-800 font-medium">Fasi Totali</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
            <div className="text-3xl font-bold text-green-700 mb-2">
              {Object.values(completedExercises).filter(Boolean).length}
            </div>
            <div className="text-green-800 font-medium">Completati</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {Object.values(workoutData).reduce((total, section) => 
                Array.isArray(section) ? total + section.length : total, 0
              )}
            </div>
            <div className="text-purple-800 font-medium">Esercizi Totali</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
            <div className="text-3xl font-bold text-amber-700 mb-2">
              {userIssues.length}
            </div>
            <div className="text-amber-800 font-medium">Limitazioni Attive</div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <WorkoutInterface />
    </div>
  );
}

export default App;