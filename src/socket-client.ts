import { Manager, Socket } from 'socket.io-client';

let socket: Socket;

export const connectToServer = (token: string) => {
    // http://localhost:3000/socket.io/socket.io.js
    // TODO: Env var to set the base URL:
    const manager: Manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
        extraHeaders: {
            hola: 'mundo',
            authentication: token
        }
    });
    socket?.removeAllListeners();
    // connect to namespace (server room). By default is root '/'
    socket = manager.socket('/');
    // console.log({socket})
    addListeners()
}

const addListeners = () => {

    const serverStatusListener = document.querySelector('#server-status')!;
    const clientsUl = document.querySelector('#clients-ul')!;
    const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;
    const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
    const messageInput = document.querySelector<HTMLInputElement>('#message-input')!;
    

    socket.on('connect', () => {
        serverStatusListener.innerHTML = 'connected!';
    })
    socket.on('disconnect', () => {
        serverStatusListener.innerHTML = 'disconnected!';
    })
    socket.on('clients-updated', (clients: string[]) => {
        let clientsHtml = '';
        clients.forEach(clientId => {
            clientsHtml += `
                <li>${clientId}</li>
            `
        })
        clientsUl.innerHTML = clientsHtml;
    });

    messageForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if(messageInput.value.trim().length <= 0) return;
        
        socket.emit('message-from-client', {
            message: messageInput?.value
        })

        messageInput.value = '';
    })

    socket.on('message-from-server', (payload: { fullName: string, message: string }) => {
        const htmlOut = `
            <li>
                <strong>${payload.fullName}</strong>
                <span>${payload.message}</span>
            </li>
        `;
        const li = document.createElement('li');
        li.innerHTML = htmlOut;
        messagesUl.append(li)
    })
}