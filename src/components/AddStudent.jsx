import React, { useState } from "react";

function AddStudent({ addStudent }) {
  const [name, setName] = useState("");
  const [math, setMath] = useState("");
  const [science, setScience] = useState("");
  const [english, setEnglish] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    addStudent({
      name,
      math: Number(math),
      science: Number(science),
      english: Number(english),
    });

    setName("");
    setMath("");
    setScience("");
    setEnglish("");
  };

  return (
    <div className="card">
      <h2>Add Student</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
        <input type="number" placeholder="Math" value={math} onChange={(e)=>setMath(e.target.value)} required />
        <input type="number" placeholder="Science" value={science} onChange={(e)=>setScience(e.target.value)} required />
        <input type="number" placeholder="English" value={english} onChange={(e)=>setEnglish(e.target.value)} required />
        <button className="primary">Add</button>
      </form>
    </div>
  );
}

export default AddStudent;