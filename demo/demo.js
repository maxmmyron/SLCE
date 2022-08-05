const comp = () => {
    const element = document.createElement('div')

    element.innerHTML = '<div>Hello</div>'

    return element
}

document.body.appendChild(comp())