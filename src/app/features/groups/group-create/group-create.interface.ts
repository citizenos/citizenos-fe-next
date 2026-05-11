import { Group } from '../../../core/interfaces/group';
import { GroupMember } from '../../../core/services/group-member-user.service';
import { Topic } from '../../../core/interfaces/topic';

export interface GroupCreateData extends Omit<Partial<Group>, 'members'> {
  members?: {
    users?: Partial<GroupMember>[];
    topics?: {
      rows?: Topic[];
      count?: number;
    };
  };
  inviteMessage?: string | null;
}
