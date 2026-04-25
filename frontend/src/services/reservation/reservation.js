import { API_BASE_URL, getStoredToken } from '../../utils/auth';

export const StoreReservationItem = async (data, businessId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/organizer/reservation/${businessId}`, {
            method : 'POST',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${getStoredToken()}`
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
        const res = await fetch(`${API_BASE_URL}/api/reservation`, {
            method : 'POST',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${getStoredToken()}`
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
    try {
        const res = await fetch(`${API_BASE_URL}/api/organizer/reservation/${businessId}`, {
            method : 'GET',
            headers : {'Authorization' : `Bearer ${getStoredToken()}`},
        })

        const response = await res.json();
        return response;
    }catch(err){
        console.error("u have an error with getting reservations", err);
    }
}

export const GetReservationItem = async (id) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/reservationItem/${id}`, {
            method : 'GET',
            headers : {'Authorization' : `Bearer ${getStoredToken()}`},
        })
        const response = await res.json();
        return response;
    }catch(err){
        console.error("u have an error with getting business item", err);
    }
}

export const UpdateReservationStatus = async (id, status) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/organizer/reservation/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
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
        const res = await fetch(`${API_BASE_URL}/api/organizer/reservation-items/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getStoredToken()}` }
        });
        return await res.json();
    } catch (err) {
        console.error("Error deleting item", err);
    }
};

export const UpdateReservationItem = async (data, businessId, itemId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/organizer/reservation/${businessId}/item/${itemId}`, {
            method : 'PUT',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${getStoredToken()}`
            },
            body : JSON.stringify(data)
        })
        const response = await res.json()
        return response;
    } catch(err) {
        console.error("u have an error with updating reservation item", err);
    }
}

export const GetMyReservations = async () => {
    const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${getStoredToken()}`
        }
    });

    const response = await res.json();

    if (!res.ok) {
        throw new Error(response.error || 'Failed to fetch reservations');
    }

    return Array.isArray(response) ? response : [];
};
