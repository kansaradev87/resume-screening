export default function MaskedResume({ pii }) {
    if (!pii) {
        return (
            <div className="glass-card results-full">
                <h2><span className="icon">🔒</span> PII Masked Resume</h2>
                <p style={{ color: 'var(--text-muted)' }}>No PII data available.</p>
            </div>
        )
    }

    const piiIcons = {
        EMAIL: '📧',
        PHONE: '📱',
        URL: '🔗',
        LINKEDIN: '💼',
        ADDRESS: '📍',
        NAME: '👤',
    }

    // Highlight masked tokens in the text
    const highlightMasked = (text) => {
        if (!text) return ''
        const parts = text.split(/(\[MASKED_[A-Z_]+\])/g)
        return parts.map((part, i) => {
            if (part.match(/^\[MASKED_[A-Z_]+\]$/)) {
                return (
                    <span key={i} className="pii-masked">{part}</span>
                )
            }
            return part
        })
    }

    return (
        <div className="glass-card results-full">
            <h2><span className="icon">🔒</span> PII Masked Resume</h2>

            {/* PII Report */}
            {pii.pii_detected && (
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Detected & Masked PII:
                    </p>
                    <div className="pii-report">
                        {(pii.pii_report || []).map((item, i) => (
                            <div key={i} className="pii-item">
                                <span className="pii-icon">{piiIcons[item.type] || '🔒'}</span>
                                <span>{item.type}</span>
                                <span className="pii-count">×{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!pii.pii_detected && (
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-green)', marginBottom: '1rem' }}>
                    ✅ No PII detected in this resume.
                </p>
            )}

            {/* Masked Text */}
            <div className="masked-resume">
                {highlightMasked(pii.masked_text)}
            </div>
        </div>
    )
}
