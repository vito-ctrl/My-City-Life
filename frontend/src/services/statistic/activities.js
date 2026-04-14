export const ActivitieStatistics = async (id) => {
    try {

        const token = localStorage.getItem('token');
        
        const res = await fetch(`http://127.0.0.1:8000/api/statistics/activities/${id}`, {
            method : 'GET',
            headers : { 'Authorization' : `Bearer ${token}`}
        })
        
        const data = await res.json();
        return data
    } catch ( err ){
        console.error("u have error in fetching the Activity stats : ", err);
    }
}