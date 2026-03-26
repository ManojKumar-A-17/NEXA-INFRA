import { ConversationWorkspace } from "@/components/ConversationWorkspace";

const UserChat = () => (
  <ConversationWorkspace
    title="Client Messages"
    description="Talk with your mapped contractor after the admin approves your request."
    emptyLabel="You will see conversations here after your request is approved and a contractor is assigned."
    role="user"
  />
);

export default UserChat;
