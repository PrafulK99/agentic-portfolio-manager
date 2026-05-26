export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Portfolio Dashboard</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Monitor your investments with AI-powered insights</p>
      </div>

      {/* Empty State */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 shadow-sm text-center">
        <span className="material-symbols-outlined text-outline inline-block text-[64px] mb-4 opacity-40">account_balance_wallet</span>
        <h3 className="font-headline-lg-mobile font-semibold text-on-surface mb-2">No Portfolio Data</h3>
        <p className="font-body-md text-on-surface-variant mb-6">Get started by analyzing your first stock using the Analyze Stock page</p>
        <a
          href="/analyze"
          className="inline-block bg-primary text-on-primary font-label-caps text-label-caps px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Analyze a Stock
        </a>
      </div>
    </div>
  );
}