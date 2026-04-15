export const getComments = async (id) => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/comments/activities/${id}`);
        const data = await res.json();
        
        if(res.ok) return data;

    } catch (err) {
        console.error("u have a fetching comments error", err);
    }
}

export const postComment = async (id, body) => {
    try {
        const token = localStorage.getItem('token'); 
        const res = await fetch(`http://127.0.0.1:8000/api/comments/activities/${id}`, {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'Accept' : 'application/json',
                'Authorization' : `Bearer ${token}`
            },
            body : JSON.stringify({body})
        })
        const data = await res.json();

        if(!res.ok){
            console.error(data);
        }else{
            console.log(data.message);
        }
    } catch ( err ) {
        console.error("u have a POSTING comments error", err);
    }
}