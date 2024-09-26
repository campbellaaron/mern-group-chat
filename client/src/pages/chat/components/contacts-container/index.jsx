import crewLogo from '@/assets/crewchat_logo.png';
import ContactList from '@/components/contact-list';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import { GET_ALL_CHANNELS_ROUTE, GET_DM_CONTACTS_ROUTES } from '@/utils/constants';
import { useEffect } from 'react';
import CreateChannel from './components/create-channel';
import NewDM from './components/new-dm';
import ProfileInfo from './components/profile-info';

const ContactsContainer = () => {

  const {setDirectMessagesContacts, directMessagesContacts, channels, setChannels } = useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      const response = await apiClient.get(GET_DM_CONTACTS_ROUTES, {withCredentials:true});
      if (response.data.contacts) {
        setDirectMessagesContacts(response.data.contacts);
      }
    }
    
    const getChannels = async () => {
      const response = await apiClient.get(GET_ALL_CHANNELS_ROUTE, {withCredentials:true});
      if (response.data.channels) {
        setChannels(response.data.channels);
      }
    }
  
    getContacts();
    getChannels();
  }, [setChannels, setDirectMessagesContacts])
  

  return (
    <div className='relative md:w-[35vw] lg:w-[25vw] xl:w-[15vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full'>
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
            <Title text="Direct Messages" />
            <NewDM />
        </div>
        <div className='max-h-[38vh] overflow-y-auto scrollbar-hidden'>
          <ContactList contacts={directMessagesContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
            <Title text="Channels" />
            <CreateChannel />
        </div>
        <div className='max-h-[38vh] overflow-y-auto scrollbar-hidden'>
          <ContactList contacts={channels} isChannel={true} />
        </div>
      </div>
      <ProfileInfo /> 
    </div>
  );
}

export default ContactsContainer

const Logo = () => {
    return (
        <div className='flex p-5 justify-center items-center gap-2 max-w-64 lg:mx-auto'>
            <img src={crewLogo} alt="An image of various colored polygons put together to resemble a pirate face, similar to Picasso, with the text Crew Chat at the bottom" />
        </div>
    )
}

const Title = ({text}) => {
    return (
        <h6 className='uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm'>{text}</h6>
    )
}