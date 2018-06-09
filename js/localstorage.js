


const getFromLocalStorage = (key) => {
    try{
        return localStorage.getItem(key)
    } catch (e){
        console.warn(e)
    }
}

const saveToLocalStorage = (key, value) => {
    try{
        localStorage.setItem(key, value)
    } catch (e){
        console.warn(e)
    }
}

export { getFromLocalStorage, saveToLocalStorage}