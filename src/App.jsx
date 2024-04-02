import { useEffect, useState } from "react"
import Trials from "../src/assets/trials.json";
import Match_Form from "../src/assets/match_form.json";
import { findEssentialQuestions } from "./utils/traverse_questions";

function App() {

  const [questions, setQuestions] = useState([]);
  const [trials, setTrials] = useState(Trials.trials);
  const [userInput, setUserInput] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInput(prevState => ({
      ...prevState,
      [name]: value
    }));

    console.log({
      ...userInput,
      [name]: value
    })

    const updateCriterion = (criterion) => {
      if (typeof criterion === "boolean") return criterion; 
      if (criterion.operator === "and" ) {
        let conditions = criterion.conditions;
        for (let i=0; i<conditions.length; i++) {
          if (typeof conditions[i] === "boolean") {
            continue;
          }
          else {
            conditions[i] = updateCriterion(conditions[i]);
            if (conditions[i] === false) return false;
            if (i === conditions.length - 1) return true;
            return {
              ...criterion,
              conditions
            }
          }
        }
      } else if (criterion.operator === "or") {
        let conditions = criterion.conditions;
        for (let i=0; i<conditions.length; i++) {
          if (typeof conditions[i] === "boolean") {
            continue;
          }
          else {
            conditions[i] = updateCriterion(conditions[i]);
            if (conditions[i] === true) return true;
            if (i === conditions.length - 1) return false;
          }
        }
        return {
          ...criterion,
          conditions
        }
      } else {
        const key = Object.keys(criterion)[0];
        if (!value) {
          return criterion;
        }
        const criterionValue = criterion[key];
        if (typeof criterionValue === "string") {
          return (criterionValue === value);
        }
        else {
          const userNumber = parseFloat(value);
          console.log(userNumber, criterionValue.max, criterionValue.min);
          if (criterionValue.max && criterionValue.min) {
            return (userNumber >= criterionValue.min && userNumber <= criterionValue.max)
          } else if (criterionValue.max) {
            return (userNumber <= criterionValue.max);
          } else {
            return (userNumber >= criterionValue.min);
          }
        }
      }
    }

    // Update trial eligibility based on user input
    const updatedTrials = trials.map(trial => {
      let criteria = trial.criteria;
      criteria = criteria.map(criterion => updateCriterion(criterion));
      return {
        ...trial,
        criteria
      }
    })
    setTrials(updatedTrials);
    setTrials(matchedUpdate(updatedTrials));
    console.log(updatedTrials);
  };

  const matchedUpdate = (trials) => {
    let newTrials = trials;
    newTrials = newTrials.map(trial => {
      if (typeof trial.criteria[0] !== "boolean") {
        return {
          ...trial,
          "matched": "undetermined"
        }
      }
      else {
        return {
          ...trial,
          "matched": trial.criteria[0]
        }
      }
    })
    return newTrials
  }

  useEffect(() => {
    const questionNames = findEssentialQuestions(trials);
    const newQuestions = Match_Form.fields.filter(field => questionNames.includes(field.name))
    setQuestions(Array.from(new Set([
      ...questions,
      ...newQuestions
    ])));
  }, [trials])

  useEffect(() => {
    setTrials(matchedUpdate(trials));
  }, [])

  return (
    <>
      {questions.map(question => {
        if (question.type === 'number') {
          return (
            <div key={question.id}>
              <label htmlFor={question.name}>{question.label}</label>
              <input
                type="number"
                id={question.name}
                name={question.name}
                min={question.min}
                step={question.step}
                className="border border-gray-500"
                onBlur={handleInputChange}
              />
            </div>
          );
        } else if (question.type === 'radio') {
          return (
            <div key={question.id}>
              <label>{question.label}</label>
              {question.options.map(option => (
                <div key={option.value}>
                  <input
                    type="radio"
                    id={`${question.name}_${option.value}`}
                    name={question.name}
                    value={option.label}
                    onBlur={handleInputChange}
                  />
                  <label htmlFor={`${question.name}_${option.value}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );
        } else if (question.type === 'select') {
          return (
            <div key={question.id}>
              <label htmlFor={question.name}>{question.label}</label>
              <select id={question.name} name={question.name} onBlur={handleInputChange}>
                <option value="">{question.placeholder}</option>
                {question.options.map(option => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        } else {
          return null;
        }
      })}
      <div>
        <span>Matched ({trials.filter(trial => trial.matched === true).length}) : </span>
        {
          trials.filter(trial => trial.matched === true).map(trial => (
            <span> {trial.name} </span>
          ))
        }
      </div>
      <div>
        <span>Undetermined ({trials.filter(trial => trial.matched === "undetermined").length}) : </span>
        {
          trials.filter(trial => trial.matched === "undetermined").map(trial => (
            <span> {trial.name} </span>
          ))
        }
      </div>
      <div>
        <span>Unmatched ({trials.filter(trial => trial.matched === false).length}) : </span>
        {
          trials.filter(trial => trial.matched === false).map(trial => (
            <span> {trial.name} </span>
          ))
        }
      </div>
    </>
  )
}

export default App
