export const createChatSlice = (set, get) => ({
    selectedChatType:undefined,
    selectedChatData:undefined,
    selectedChatMessages:[],
    directMessagesContacts: [],
    isUploading: false,
    isDownloading: false,
    uploadProgress:0,
    downloadProgress:0,
    channels:[],
    setSelectedChatType: (selectedChatType)=>set({selectedChatType}),
    setSelectedChatData: (selectedChatData)=>set({selectedChatData}),
    setSelectedChatMessages: (selectedChatMessages)=>set({selectedChatMessages}),
    setDirectMessagesContacts: (directMessagesContacts) => set({directMessagesContacts}),
    setIsUploading: (isUploading)=>set({isUploading}),
    setIsDownloading: (isDownloading)=>set({isDownloading}),
    setUploadProgress: (uploadProgress)=>set({uploadProgress}),
    setDownloadProgress: (downloadProgress)=>set({downloadProgress}),
    setChannels: (channels)=>set({channels}),
    closeChat:()=>set({selectedChatData:undefined,selectedChatType:undefined, selectedChatMessages:[],}),
    addChannel: (channel)=>{
        const channels = get().channels;
        set({channels:[channel, ...channels]});
    },
    addMessage:(message)=> {
        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;

        set({
            selectedChatMessages:[
                ...selectedChatMessages, {
                    ...message,
                    recipient: selectedChatType === "channel" ? message.recipient : message.recipient._id,
                    sender: selectedChatType === "channel" ? message.sender : message.sender._id,
                },
            ],
        });
    },
    addChannelInList:(message)=> {
        const channels = get().channels;
        const data = channels.find((channel)=>channel._id === message.channelId);
        const index = channels.findIndex((channel)=>channel._id === message.channelId);
        console.log(channels,data,index);
        if (index !== -1 && index !== undefined) {
            channels.splice(index, 1);
            channels.unshift(data);
        }
    },
    
    addContactsInDmList:(message)=> {
        const userId = get().userInfo.id;
        const fromId = message.sender._id === userId ? message.recipient._id : message.sender._id;
        const fromData = message.sender._id === userId ? message.recipient : message.sender;
        const dmContacts = get().directMessagesContacts;
        const data = dmContacts.find((contact)=> contact._id === fromId);
        const index = dmContacts.findIndex((contact)=> contact._id === fromId);
        if (index !== -1 && index !== undefined) {
            console.log("in if condition");
            dmContacts.splice(index, 1);
            dmContacts.unshift(data);
        } else {
            console.log("In else condition");
            dmContacts.unshift(fromData);
        }
        set({directMessagesContacts: dmContacts });
    }
});