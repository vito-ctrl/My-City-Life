import React, { useState } from 'react'

const ActivityForm = () => {
    const [ Form, setForm ] = useState({
        'title': "",
        'description': "",
        'category': "",
        'location': "",
        'price': 0,
        'isFree': true,
        'image': "",
        'start_date': '10-23-2333',
        'end_date': '10-23-2333'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(form => ({...form, [name] : value}))
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const res = await fetch('http://127.0.0.1:8000/activity/create', {
            method : 'POST',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-Type' : 'Application/json',
                'Accept' : 'Application/json',
            },
            body: JSON.stringify({Form})
        });

        const data = res.json();
        console.log("result : ", data);
        console.log("form : ", Form);
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
                <label htmlFor="text">isFree</label>
                <input type="bool" name="isFree" placeholder="isFree" required className={inputClass} onChange={handleChange} />
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