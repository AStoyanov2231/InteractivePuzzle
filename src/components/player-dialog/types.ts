export interface TeamPlayer {
  name: string;
  id: string;
}

export interface Team {
  id: string;
  name: string;
  players: TeamPlayer[];
  points?: number;
}

export interface PlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameStart?: () => void;
}
