class AddListener{
    constructor(element)
    {
        this.element = element;
    }

    addSingleClick(funcToCall)
    {
        this.element.addEventListener('click',funcToCall);
    }
}

export default AddListener;