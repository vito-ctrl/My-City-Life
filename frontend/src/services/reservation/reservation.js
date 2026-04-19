export const StoreReservationItem = async (data, businessId) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/organizer/reservation/${businessId}`, {
            method : 'POST',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            body : JSON.stringify(data)
        })
        const response = await res.json()
        return response ;
    }catch(err){
        console.error("u have an error with posting reservation item", err);
    }
}

export const Reservation = async (data) => {
    try {
        await fetch(`http://127.0.0.1:8000/api/reservation`, {
            method : 'POST',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            body : JSON.stringify(data)
        })

        const response = await res.json()
        return response ;
    }catch(err){
        console.error("u have an error with posting reservation", err);
    }
}

export const GetReservations = async () => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/reservation`, {
            headers : {'Authorization' : `Bearer ${localStorage.getItem('token')}`},
        })

        const response = await res.json();
        return response;
    }catch(err){
        console.error("u have an error with getting reservations", err);
    }
}

export const GetReservationItem = async (id) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/reservationItem/${id}`, {
            method : 'GET',
            headers : {'Authorization' : `Bearer ${localStorage.getItem('token')}`},
        })
        const response = await res.json();
        return response;
    }catch(err){
        console.error("u have an error with getting business item", err);
    }
}
