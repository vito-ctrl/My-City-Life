export const GeneralStatistics = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/statistics/general`, {
            method : 'GET',
            headers : { 'Authorization' : `Bearer ${token}`}
        })
        
        const data = await res.json();
        return data
    } catch ( err ){
        console.error("u have error in fetching the general stats : ", err);
    }
}