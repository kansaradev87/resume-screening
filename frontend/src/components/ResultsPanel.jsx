import { useState } from 'react'
import FeatureChart from './FeatureChart'
import MaskedResume from './MaskedResume'

export default function ResultsPanel({ results, onReset }) {
    const [activeTab, setActiveTab] = useState('overview')

    if (results.error) {
        return (
            <div className="results-section">
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h2><span className="icon">⚠️</span> Error</h2>
                    <p style={{ color: 'var(--accent-red)' }}>{results.error}</p>
                    <div className="new-screening">
                        <button className="btn-primary" onClick={onReset} style={{ maxWidth: '300px' }}>
                            ← Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const decision = results.decision || 'UNKNOWN'
    const confidence = results.confidence || 0
    const decisionClass = decision === 'ACCEPT' ? 'accept' : decision === 'REJECT' ? 'reject' : 'borderline'
    const decisionIcon = decision === 'ACCEPT' ? '✅' : decision === 'REJECT' ? '❌' : '⚠️'

    const tabs = [
        { key: 'overview', label: '📊 Overview' },
        { key: 'rules', label: '📋 Rules' },
        { key: 'ml', label: '🤖 ML Analysis' },
        { key: 'explanation', label: '💡 Explanation' },
        { key: 'resume', label: '🔒 Masked Resume' },
    ]

    return (
        <div className="results-section">
            {/* Decision Banner */}
            <div className={`decision-banner ${decisionClass}`}>
                <div className="decision-icon">{decisionIcon}</div>
                <h2>{decision}</h2>
                <p className="confidence">
                    Confidence: {(confidence * 100).toFixed(1)}% • Position: {results.job_title || 'N/A'}
                </p>
                <div className="confidence-meter">
                    <div className="meter-bar">
                        <div
                            className={`meter-fill ${decisionClass}`}
                            style={{ width: `${confidence * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-nav">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <OverviewTab results={results} />}
            {activeTab === 'rules' && <RulesTab results={results} />}
            {activeTab === 'ml' && <MLTab results={results} />}
            {activeTab === 'explanation' && <ExplanationTab results={results} />}
            {activeTab === 'resume' && <MaskedResume pii={results.pii} />}

            {/* New Screening */}
            <div className="new-screening">
                <button className="btn-primary" onClick={onReset} style={{ maxWidth: '300px' }}>
                    ← New Screening
                </button>
            </div>
        </div>
    )
}

function OverviewTab({ results }) {
    const features = results.features || {}

    return (
        <div>
            <div className="results-grid">
                {/* Skills */}
                <div className="glass-card">
                    <h2><span className="icon">🎯</span> Skills Analysis</h2>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Match Ratio: </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                            {((features.skill_match_ratio || 0) * 100).toFixed(0)}%
                        </span>
                    </div>
                    {features.skills_matched?.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Matched Skills</p>
                            <div className="skills-tags">
                                {features.skills_matched.map((s, i) => (
                                    <span key={i} className="skill-tag matched">✓ {s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {features.skills_missing?.length > 0 && (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Missing Skills</p>
                            <div className="skills-tags">
                                {features.skills_missing.map((s, i) => (
                                    <span key={i} className="skill-tag missing">✗ {s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Candidate Profile */}
                <div className="glass-card">
                    <h2><span className="icon">👤</span> Candidate Profile</h2>
                    <div className="ml-scores">
                        <div>
                            <div className="score-row">
                                <span className="score-label">Experience</span>
                                <span className="score-value">{features.experience_years || 0} years</span>
                            </div>
                            <div className="score-bar">
                                <div className="score-bar-fill" style={{ width: `${Math.min((features.experience_years || 0) / 10 * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="score-row">
                                <span className="score-label">Education</span>
                                <span className="score-value" style={{ textTransform: 'capitalize' }}>
                                    {features.education_level || 'Unknown'}
                                </span>
                            </div>
                            <div className="score-bar">
                                <div className="score-bar-fill" style={{ width: `${(features.education_score || 0) / 4 * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="score-row">
                                <span className="score-label">Total Skills</span>
                                <span className="score-value">{features.total_skills_count || 0}</span>
                            </div>
                            <div className="score-bar">
                                <div className="score-bar-fill" style={{ width: `${Math.min((features.total_skills_count || 0) / 15 * 100, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Factors */}
            <div className="results-grid">
                <div className="glass-card">
                    <h2><span className="icon">✅</span> Positive Factors</h2>
                    <ul className="factors-list animate-in">
                        {(results.explanation?.positive_factors || []).map((f, i) => (
                            <li key={i}>
                                <span className="factor-icon">🟢</span>
                                {f}
                            </li>
                        ))}
                        {(!results.explanation?.positive_factors?.length) && (
                            <li><span className="factor-icon">—</span> No strong positive factors detected</li>
                        )}
                    </ul>
                </div>
                <div className="glass-card">
                    <h2><span className="icon">❌</span> Negative Factors</h2>
                    <ul className="factors-list animate-in">
                        {(results.explanation?.negative_factors || []).map((f, i) => (
                            <li key={i}>
                                <span className="factor-icon">🔴</span>
                                {f}
                            </li>
                        ))}
                        {(!results.explanation?.negative_factors?.length) && (
                            <li><span className="factor-icon">—</span> No significant negative factors</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function RulesTab({ results }) {
    const ruleResults = results.rule_analysis?.rule_results || []

    return (
        <div className="glass-card results-full">
            <h2><span className="icon">📋</span> Rule-Based Analysis</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {results.rule_analysis?.summary}
            </p>
            <div className="animate-in">
                {ruleResults.map((rule, i) => (
                    <div key={i} className="rule-item">
                        <span className="rule-status">
                            {rule.passed ? '✅' : '❌'}
                        </span>
                        <div className="rule-info">
                            <h4>
                                {rule.rule_name}
                                {rule.is_critical && <span className="critical-badge">CRITICAL</span>}
                            </h4>
                            <p>{rule.reason}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function MLTab({ results }) {
    const ml = results.ml_analysis || {}

    return (
        <div>
            <div className="results-grid">
                <div className="glass-card">
                    <h2><span className="icon">📈</span> Model Scores</h2>
                    <div className="ml-scores">
                        <div>
                            <div className="score-row">
                                <span className="score-label">Logistic Regression</span>
                                <span className="score-value">{((ml.lr_probability || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="score-bar">
                                <div className="score-bar-fill" style={{ width: `${(ml.lr_probability || 0) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="score-row">
                                <span className="score-label">Naive Bayes</span>
                                <span className="score-value">{((ml.nb_probability || 0) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="score-bar">
                                <div className="score-bar-fill" style={{ width: `${(ml.nb_probability || 0) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="score-row">
                                <span className="score-label">Hybrid (α=0.5)</span>
                                <span className="score-value" style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>
                                    {((ml.hybrid_probability || 0) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="score-bar">
                                <div className="score-bar-fill" style={{ width: `${(ml.hybrid_probability || 0) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                        Hybrid Score = 0.5 × LR + 0.5 × NB
                    </p>
                </div>

                <div className="glass-card">
                    <h2><span className="icon">📊</span> Feature Contributions</h2>
                    <FeatureChart contributions={ml.feature_contributions || {}} />
                </div>
            </div>
        </div>
    )
}

function ExplanationTab({ results }) {
    const explanation = results.explanation || {}

    return (
        <div className="glass-card results-full">
            <h2><span className="icon">💡</span> Full Explanation</h2>
            <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {explanation.summary}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {explanation.decision_basis}
                </p>
            </div>

            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
                Rule-Based Explanations
            </h3>
            <div className="animate-in">
                {(explanation.rule_explanations || []).map((re, i) => (
                    <div key={i} style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        borderLeft: `2px solid ${re.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                        marginBottom: '0.4rem',
                        lineHeight: 1.6,
                    }}>
                        {re}
                    </div>
                ))}
            </div>

            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
                ML Analysis Details
            </h3>
            <div className="explanation-text">
                {explanation.ml_explanation || 'No ML analysis available.'}
            </div>

            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
                Recommendation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {explanation.recommendation}
            </p>
        </div>
    )
}
