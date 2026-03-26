import { ConversationWorkspace } from "@/components/ConversationWorkspace";

const ContractorChat = () => (
  <ConversationWorkspace
    title="Contractor Messages"
    description="Chat with assigned clients to understand requirements and move projects forward."
    emptyLabel="Assigned client conversations will appear here after the admin maps you to a project."
    role="contractor"
  />
);

export default ContractorChat;
