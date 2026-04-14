
export const getActivityLikes = async (id) => {
    const token = localStorage.getItem('token');
    // console.log(token);
    try {
        const res = await fetch (`http://127.0.0.1:8000/api/like/activities/${id}`, {
            method : 'GET',
            headers : { 'Authorization' : `Bearer ${token}`}
        })
        const data = await res.json();
        return data;
    } catch ( err ) {
        console.error("Error fetching likes:", err);
        throw err;
    }
};