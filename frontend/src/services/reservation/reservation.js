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

export const GetReservations = async (businessId) => {
    console.log("hi");
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/organizer/reservation/${businessId}`, {
            method : 'GET',
            headers : {'Authorization' : `Bearer ${localStorage.getItem('token')}`},
        })

        const response = await res.json();
        return response;
    }catch(err){
        console.error("u have an error with getting reservations", err);
    }
}

export const GetReservationItem = async (id) => {
    console.log("sjbha fsd fs hsg fshd ");
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

export const UpdateReservationStatus = async (id, status) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/organizer/reservation/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        return await res.json();
    } catch (err) {
        console.error("Error updating status", err);
    }
};

export const DeleteReservationItem = async (id) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/organizer/reservation-items/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return await res.json();
    } catch (err) {
        console.error("Error deleting item", err);
    }
};

export const UpdateReservationItem = async (data, businessId, itemId) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/organizer/reservation/${businessId}/item/${itemId}`, {
            method : 'PUT',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${localStorage.getItem('token')}`
            },
            body : JSON.stringify(data)
        })
        const response = await res.json()
        return response;
    } catch(err) {
        console.error("u have an error with updating reservation item", err);
    }
}
