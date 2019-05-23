const axios = require('axios')

axios.post('https://flutter-products-3e91e.firebaseio.com/test.json', {
    todo: 'Buy the milk'
})
    .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res.data.name)
    })
    .catch((error) => {
        console.error(error)
    })