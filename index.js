const express = require('express');
const { createClient } = require('redis');
const axios = require('axios')
const app = express();

app.use(express.json())

const client = createClient({ url: "redis://127.0.0.1:6379" });


client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    try{
        await client.connect();
        console.log('con')
    }catch(error){
        console.log(error)
    }
})();


app.post('/', async (req, res) =>{
    const {key, value} = req.body;
    const response = await client.set(key,value)  // отправляем ключ:значение
    res.json(response)
})

app.get('/', async (req, res) =>{
    const {key} = req.body;
    const response = await client.get(key)  // отправляем ключ:значение
    res.json(response)
})

app.get('/posts/:id',async (req,res) =>{
    const {id} = req.params

    const cachedPost = await client.get(`post-${id}`);

    if(cachedPost){
        return res.json(JSON.parse(cachedPost))
    }
    
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)

    client.set(`post-${id}`, JSON.stringify(response.data))

    return res.json(response.data)
})

app.listen(3000, ()=>{
    console.log('Server started')
});