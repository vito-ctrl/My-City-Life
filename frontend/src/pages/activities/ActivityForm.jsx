import React, { useState } from 'react'

const ActivityForm = () => {
    const [Form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
        price: 0,
        is_free: true,
        image: "",
        start_date: '',
        end_date: ''
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // Convert string "true"/"false" from a select/input to actual boolean
        const finalValue = type === 'checkbox' ? e.target.checked : 
                        value === "true" ? true : 
                        value === "false" ? false : value;
                        
        setForm(form => ({...form, [name] : finalValue}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        console.log(token);
        console.log("form : ", Form);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/activities/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                // Spreading Form sends { title: "", description: "" } 
                // instead of { Form: { title: "" } }
                body: JSON.stringify({ ...Form }) 
            });

            const data = await res.json(); // Don't forget to await this!
            
            if (!res.ok) {
                console.error("Validation or Auth Error:", data);
            } else {
                console.log("Success:", data);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    }

    const inputClass =
    'w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[0.8125rem] focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all';
    return (
        <>
            <div>
                <label htmlFor="text">title</label>
                <input type="text" name="title" placeholder="Full Name" required className={inputClass} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="text">description</label>
                <input type="text" name="description" placeholder="Full Name" required className={inputClass} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="text">category</label>
                <input type="text" name="category" placeholder="Full Name" required className={inputClass} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="text">location</label>
                <input type="text" name="location" placeholder="location" required className={inputClass} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="text">price</label>
                <input type="number" name="price" placeholder="price" required className={inputClass} onChange={handleChange} />
            </div>

            <div>
                <label>Is it free?</label>
                <select name="is_free" className={inputClass} onChange={handleChange}>
                    <option value={true}>yes</option>
                    <option value={false}>no</option>
                </select>
            </div>

            <div>
                <label htmlFor="text">image</label>
                <input type="text" name="image" placeholder="image" required className={inputClass} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="text">start_date</label>
                <input type="date" name="start_date" placeholder="start_date" required className={inputClass} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="text">end_date</label>
                <input type="date" name="end_date" placeholder="end_date" required className={inputClass} onChange={handleChange} />
            </div>

            <button onClick={handleSubmit}>submit</button>
        </>
    )
}

export default ActivityForm