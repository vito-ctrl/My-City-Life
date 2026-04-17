export const getFavorites = async (type, id) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch (`http://127.0.0.1:8000/api/favorite/${type}/${id}`, {
            method : 'GET',
            headers : { 'Authorization' : `Bearer ${token}`}
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error fetching favorites:", err);
        throw err;    
    }
}
