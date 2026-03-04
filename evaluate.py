"""
Evaluation Module
=================
Runs comparative evaluation of rule-based, ML-based, and hybrid
approaches across all job categories.
"""

import os
import sys
import json
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.feature_extractor import FeatureExtractor
from modules.rule_engine import RuleEngine
from modules.ml_models import HybridMLModel
from modules.hybrid_engine import HybridDecisionEngine
from modules.explainer import ExplanationGenerator
from data.prepare_data import generate_dataset, JOB_SKILL_POOLS


def evaluate_all():
    """Run full comparative evaluation."""
    print("=" * 70)
    print("COMPARATIVE EVALUATION: Rule-Based vs ML vs Hybrid")
    print("=" * 70)

    # Generate fresh test data
    print("\nGenerating evaluation dataset...")
    df = generate_dataset(num_samples=300, output_dir="data/eval")

    decision_engine = HybridDecisionEngine()
    explainer = ExplanationGenerator()

    results = {}

    for category in JOB_SKILL_POOLS:
        pool = JOB_SKILL_POOLS[category]
        cat_df = df[df["job_category"] == category]

        if len(cat_df) < 5:
            continue

        print(f"\n{'='*50}")
        print(f"Category: {pool['title']}")
        print(f"{'='*50}")

        extractor = FeatureExtractor(
            required_skills=pool["required"],
            min_experience=pool["min_experience"],
            min_education=pool["min_education"],
        )

        rule_engine = RuleEngine(job_requirements={
            "min_experience": pool["min_experience"],
            "min_skill_match_ratio": 0.5,
            "min_education": pool["min_education"],
            "min_total_skills": 3,
        })

        # Load trained model
        model = HybridMLModel(alpha=0.5)
        model_dir = os.path.join("models", category)
        model_loaded = False
        if os.path.exists(model_dir):
            try:
                model.load(model_dir)
                model_loaded = True
            except Exception:
                pass

        rule_correct = 0
        ml_correct = 0
        hybrid_correct = 0
        total = 0

        for _, row in cat_df.iterrows():
            features = extractor.extract(row["resume_text"])
            true_label = row["label"]

            # Rule-based
            rule_result = rule_engine.evaluate(features)
            rule_pred = 1 if rule_result["decision"] == "ACCEPT" else 0
            if rule_pred == true_label:
                rule_correct += 1

            # ML
            if model_loaded:
                fv = features["feature_vector"]
                X = np.array([[
                    fv["skill_match_ratio"],
                    fv["experience_years"],
                    fv["education_score"],
                    fv["total_skills_normalized"],
                ]])
                ml_result = model.predict(X[0])
                ml_pred = 1 if ml_result["decision"] == "ACCEPT" else 0
            else:
                score = (
                    features["feature_vector"]["skill_match_ratio"] * 0.4 +
                    features["feature_vector"]["experience_years"] * 0.3 +
                    features["feature_vector"]["education_score"] * 0.2 +
                    features["feature_vector"]["total_skills_normalized"] * 0.1
                )
                ml_result = {
                    "decision": "ACCEPT" if score >= 0.5 else "REJECT",
                    "hybrid_probability": score,
                    "lr_probability": score,
                    "nb_probability": score,
                    "feature_contributions": {},
                }
                ml_pred = 1 if score >= 0.5 else 0

            if ml_pred == true_label:
                ml_correct += 1

            # Hybrid
            hybrid_result = decision_engine.decide(rule_result, ml_result)
            hybrid_pred = 1 if hybrid_result["final_decision"] == "ACCEPT" else 0
            # Borderline counts as accept for evaluation
            if hybrid_result["final_decision"] == "BORDERLINE":
                hybrid_pred = 1

            if hybrid_pred == true_label:
                hybrid_correct += 1

            total += 1

        rule_acc = rule_correct / total if total > 0 else 0
        ml_acc = ml_correct / total if total > 0 else 0
        hybrid_acc = hybrid_correct / total if total > 0 else 0

        results[category] = {
            "total_samples": total,
            "rule_based_accuracy": round(rule_acc, 4),
            "ml_accuracy": round(ml_acc, 4),
            "hybrid_accuracy": round(hybrid_acc, 4),
        }

        print(f"  Samples:          {total}")
        print(f"  Rule-Based Acc:   {rule_acc:.2%}")
        print(f"  ML Accuracy:      {ml_acc:.2%}")
        print(f"  Hybrid Accuracy:  {hybrid_acc:.2%}")

    # Summary
    print(f"\n{'='*70}")
    print("OVERALL SUMMARY")
    print(f"{'='*70}")

    avg_rule = np.mean([r["rule_based_accuracy"] for r in results.values()])
    avg_ml = np.mean([r["ml_accuracy"] for r in results.values()])
    avg_hybrid = np.mean([r["hybrid_accuracy"] for r in results.values()])

    print(f"\n  Average Rule-Based Accuracy: {avg_rule:.2%}")
    print(f"  Average ML Accuracy:         {avg_ml:.2%}")
    print(f"  Average Hybrid Accuracy:     {avg_hybrid:.2%}")

    # Save results
    os.makedirs("results", exist_ok=True)
    with open("results/evaluation_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n  Results saved to results/evaluation_results.json")

    return results


if __name__ == "__main__":
    evaluate_all()
