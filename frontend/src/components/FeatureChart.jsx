export default function FeatureChart({ contributions }) {
    if (!contributions || Object.keys(contributions).length === 0) {
        return (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No feature contribution data available.
            </p>
        )
    }

    // Sort by absolute contribution
    const sorted = Object.entries(contributions).sort(
        (a, b) => Math.abs(b[1].contribution || 0) - Math.abs(a[1].contribution || 0)
    )

    const maxContrib = Math.max(
        ...sorted.map(([, v]) => Math.abs(v.contribution || 0)),
        0.01
    )

    const formatName = (name) => {
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
    }

    return (
        <div className="feature-chart">
            {sorted.map(([name, info]) => {
                const contrib = info.contribution || 0
                const isPositive = contrib >= 0
                const barWidth = Math.max((Math.abs(contrib) / maxContrib) * 100, 5)

                return (
                    <div key={name} className="feature-bar-row">
                        <div className="feature-name">{formatName(name)}</div>
                        <div className="bar-container">
                            <div
                                className={`bar-fill ${isPositive ? 'positive' : 'negative'}`}
                                style={{ width: `${barWidth}%` }}
                            >
                                <span className="bar-value">
                                    {isPositive ? '+' : ''}{contrib.toFixed(3)}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
