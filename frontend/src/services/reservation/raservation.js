const StoreReservationItem = async (data, businessId) => {
    try {
        await fetch(`http://127.0.0.1:8000/api/organizer/reservation/${businessId}`, {
            method : 'POST',
            headers : {'Authorization' : `Bearer ${localStorage.getItem('token')}`},
            body : JSON.stringify({data})
        })
    }catch(err){
        console.error("u have an error with posting reservation item", err);
    }
}

const Reservation = async (data) => {
    try {
        await fetch(`http://127.0.0.1:8000/api/reservation`, {
            method : 'POST',
            headers : {'Authorization' : `Bearer ${localStorage.getItem('token')}`},
            body : JSON.stringify({data})
        })
    }catch(err){
        console.error("u have an error with posting reservation item", err);
    }
}

const GetReservations = async () => {
    try {
        await fetch(`http://127.0.0.1:8000/api/reservation`, {
            headers : {'Authorization' : `Bearer ${localStorage.getItem('token')}`},
        })
    }catch(err){
        console.error("u have an error with posting reservation item", err);
    }
}