function match (string) {
    let foundA = false;
    for(let q of string) {
        if(q === 'a')
            foundA = true;
        else if(foundA && q === 'b')
            return true;
        else
            foundA = false;
    }
    return false;
};

match('wo shi acGroot');