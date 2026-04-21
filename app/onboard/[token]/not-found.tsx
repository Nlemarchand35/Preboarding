export default function OnboardNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide ou expiré</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Ce lien de preboarding ne correspond à aucun dossier actif.
          Vérifiez votre email ou contactez votre recruteur.
        </p>

        <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Que faire ?</p>
          <ul className="space-y-2.5">
            {[
              'Vérifiez que vous avez cliqué sur le bon lien dans votre email',
              'L\'email peut provenir de votre recruteur ou de preboarding@…',
              'Contactez directement votre recruteur si le problème persiste',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-gray-500 font-semibold">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600 leading-snug">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-gray-400 mt-8">Propulsé par Preboarding</p>
      </div>
    </div>
  )
}
