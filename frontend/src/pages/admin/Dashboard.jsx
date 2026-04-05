import React, { useEffect } from 'react'

const Dashboard = () => {
    useEffect(() => {
        const khdm = async() => {
            const token = localStorage.getItem('token');
            console.log(token);
            const res = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Accept': 'application/json',
                    'Authorization' : `Bearer ${token}`
                }
            })
            const data = await res.json();
            console.log(data);
        }

        khdm();
    })
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard