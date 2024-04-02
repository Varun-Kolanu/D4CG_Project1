import Trials from "../assets/trials.json" assert { type: "json" };

export function findEssentialQuestions(trials) {
    let essentialQuestions = [];

    function traverseCriteria(criterion) {
        if (criterion.operator === "and") {
            // Look for single conditions in "and"
            for (const condition of criterion.conditions) {
                if (typeof condition !== "boolean") {
                    if (!condition.operator) {
                        // Single condition found, add its key to essential questions
                        const key = Object.keys(condition)[0];
                        essentialQuestions.push(key);
                    }
                    else {
                        traverseCriteria(condition)
                    }
                    break;
                }
            }
        } else if (criterion.operator === "or") {
            // Look for single conditions in "or"
            for (const condition of criterion.conditions) {
                if (typeof condition !== "boolean") {
                    if (!condition.operator) {
                        // Single condition found, add its key to essential questions
                        const key = Object.keys(condition)[0];
                        essentialQuestions.push(key);
                    }
                    else {
                        traverseCriteria(condition)
                    }
                }
            }
        }

    }

    trials.forEach(trial => {
        traverseCriteria(trial.criteria[0])
    })

    essentialQuestions = Array.from(new Set(essentialQuestions))
    return essentialQuestions;
}

