import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import Modal from 'react-modal';
import { MdFolderZip } from "react-icons/md"
import { IoMdArrowRoundDown } from "react-icons/io";
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, HOST } from "@/utils/constants";
import moment from "moment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from '@/lib/utils';
import { useRef, useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

const MessageContainer = () => {

    Modal.setAppElement('#root'); // Ensure this matches your app's root element (usually 'root' or 'app')

    const scrollRef = useRef();
    const { selectedChatType, selectedChatData, userInfo, selectedChatMessages, setSelectedChatMessages, setIsDownloading, setDownloadProgress } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState("");

    // Open modal when image is clicked
    const openModal = (imageSrc) => {
        setModalImageSrc(imageSrc);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageSrc("");
    };

    useEffect(() => {

        const getMessages = async () => {
            try {
                const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, { id: selectedChatData._id }, { withCredentials: true });
                if (response.data.messages) {
                    setSelectedChatMessages(response.data.messages);
                }
            } catch (error) {
                console.log({ error });
            }
        }
        
        const getChannelMessages = async () => {
            try {
                const response = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`, { withCredentials: true });
                if (response.data.messages) {
                    setSelectedChatMessages(response.data.messages);
                }
            } catch (error) {
                console.log({ error });
            }
        }

        if (selectedChatData._id) {
            if (selectedChatType === "contact") {
                getMessages();
            } else if (selectedChatType ===  "channel") {
                getChannelMessages();
            }
        }
    }, [selectedChatData, selectedChatType, setSelectedChatMessages]);


    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages]);

    // Creating a downloadable link using the axios API call to the file upload then removes the link after clicking on it
    const downloadFile = async (url) => {
        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const response = await apiClient.get(url, { // Use url directly (it's already the full path)
                responseType: "blob",
                onDownloadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    const percentCompleted = Math.round((loaded * 100) / total);
                    setDownloadProgress(percentCompleted);
                }
            });
            const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = urlBlob;
            link.setAttribute("download", url.split("/").pop());
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(urlBlob);
            setIsDownloading(false);
            setDownloadProgress(0);
        } catch (error) {
            setIsDownloading(false);
            setDownloadProgress(0);
            console.error("Error downloading file: ", error);
        }
    };

    const isEmojiOnly = (content) => {
        // Ensure content is a string before performing trim
        if (!content || typeof content !== "string") {
            return false; // If content is undefined or not a string, return false
        }

        // Regular expression to detect emoji characters
        const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;

        // Check if the message is entirely composed of emojis
        return emojiRegex.test(content.trim());
    };

    const checkIfImage = (filePath) => {
        const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
        return imageRegex.test(filePath.split('?')[0]);  // Ignore query parameters
    };


    const renderMessages = () => {
        let lastDate = null;
        return selectedChatMessages.map((message, index) => {
            const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;

            return (
                <div key={index}>
                    {showDate && (<div className="text-center text-gray-500 my-2">
                        {moment(message.timestamp).format("LL")}
                    </div>)}
                    {selectedChatType === "contact" && renderDmMessages(message)}
                    {selectedChatType === "channel" && renderChannelMessages(message)}
                </div>
            );
        });
    };

    const detectAndWrapLinks = (content) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g; // Matches URLs that start with http:// or https://
        return content.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
        });
    };

    const renderDmMessages = (message) => {
        const isEmoji = isEmojiOnly(message.content || ""); // Provide a default empty string if content is undefined
        const contentWithLinks = detectAndWrapLinks(message.content || ""); // Provide a default empty string if content is undefined

        return (
            <div className={`${message.sender === selectedChatData._id ? "text-left" : "text-right"}`}>
                {message.messageType === "text" && (
                    <div
                        className={`${message.sender !== selectedChatData._id
                            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                            : "bg-[#2a2b33]/5 text-white/80 border-[#fff]/20"
                            } border inline-block p-4 rounded my-1 max-w-[50%] break-words ${isEmoji ? "emoji-only border-none bg-transparent" : ""}`}
                        dangerouslySetInnerHTML={{ __html: contentWithLinks }} // Inject content with links
                    />
                )}
                {message.messageType === "file" && (
                    <div className={`${message.sender !== selectedChatData._id
                        ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                        : "bg-[#2a2b33]/5 text-white/80 border-[#fff]/20"
                        } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
                        {checkIfImage(message.fileUrl) ? <div className="cursor-pointer" onClick={() => openModal(`${message.fileUrl}`)}>
                            <img src={`${message.fileUrl}`} height={300} width={300} alt="" />
                        </div> : <div className="flex items-center justify-center gap-5">
                            <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                                <MdFolderZip />
                            </span>
                            <span>{message.fileUrl.split('/').pop()}</span>
                            <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300" onClick={() => downloadFile(message.fileUrl)}>
                                <IoMdArrowRoundDown />
                            </span>
                        </div>
                        }
                    </div>
                )}
                <div className="text-xs text-gray-600">
                    {moment(message.timestamp).format("LT")}
                </div>
            </div>
        );
    };

    const renderChannelMessages = (message) => {
        const senderId = message.sender._id;
        const isEmoji = isEmojiOnly(message.content || ""); // Provide a default empty string if content is undefined
        const contentWithLinks = detectAndWrapLinks(message.content || ""); // Provide a default empty string if content is undefined
    
        return (
            <div className={`mt-5 ${senderId !== userInfo.id ? "text-left" : "text-right"}`}>
                {message.sender._id !== userInfo.id ? (
                    <div className="flex items-center justify-start gap-3">
                        <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                        {message.sender.image && <AvatarImage src={`${message.sender.image}`} alt="profile image" className="object-cover w-full h-full bg-black" />}
                            <AvatarFallback className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(message.sender.color)}`}>
                                {message.sender.firstName ? message.sender.firstName.charAt(0) : (message.sender.email?.charAt(0) || '')}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
                        <span className="text-xs text-white/60">{moment(message.timestamp).format("LT")}</span>
                    </div>
                ) : (
                    <div className="text-xs text-white/60 mt-1">{moment(message.timestamp).format("LT")}</div>
                )}
                {message.messageType === "text" && (
                    <div
                        className={`${senderId === userInfo.id
                            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                            : "bg-[#2a2b33]/5 text-white/80 border-[#fff]/20"
                            } border inline-block p-4 rounded my-1 max-w-[50%] break-words ${isEmoji ? "emoji-only border-none bg-transparent" : ""}`}
                        dangerouslySetInnerHTML={{ __html: contentWithLinks }} // Inject content with links
                    />
                )}
                {message.messageType === "file" && (
                    <div className={`${senderId === userInfo.id
                        ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                        : "bg-[#2a2b33]/5 text-white/80 border-[#fff]/20"
                        } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}>
                        {checkIfImage(message.fileUrl) ? (
                            <div className="cursor-pointer" onClick={() => openModal(`${message.fileUrl}`)}>
                                <img src={`${message.fileUrl}`} height={300} width={300} alt="" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-5">
                                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                                    <MdFolderZip />
                                </span>
                                <span>{message.fileUrl.split('/').pop()}</span>
                                <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300" onClick={() => downloadFile(message.fileUrl)}>
                                    <IoMdArrowRoundDown />
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };
    
    
    return (
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
            {renderMessages()}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Image Modal"
                    className="modal-content relative w-full md:w-[70vw] lg:w-[60vw] md:max-w-[70vw] lg:max-w-[60vw] max-w-md"
                    overlayClassName="modal-overlay"
                >
                    <button
                        className="bg-black/20 p-3 text-2xl rounded-full fixed top-30 mx-auto hover:bg-black/50 cursor-pointer transition-all duration-300"
                        onClick={() => downloadFile(modalImageSrc)} // Call downloadFile with modalImageSrc
                    >
                        <IoMdArrowRoundDown />
                    </button>
                    <button onClick={closeModal} className="bg-black/20 p-3 text-2xl rounded-full mx-auto fixed top-28 close-modal-btn hover:bg-black/50 cursor-pointer transition-all duration-300"><IoCloseSharp /></button>
                    <img src={modalImageSrc} alt="Full size preview" className="" />
                </Modal>
            )}
            <div ref={scrollRef} />
        </div>
    );
};

export default MessageContainer