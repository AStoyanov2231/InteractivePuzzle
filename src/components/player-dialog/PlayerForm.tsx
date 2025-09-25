import { useForm } from "react-hook-form";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

type PlayerFormValues = {
  playerName: string;
};

interface PlayerFormProps {
  onAddPlayer: (name: string) => void;
  generateDummyNames: () => void;
  playerCount: number;
}

export function PlayerForm({ onAddPlayer, generateDummyNames, playerCount }: PlayerFormProps) {
  const { toast } = useToast();
  const form = useForm<PlayerFormValues>({
    defaultValues: {
      playerName: "",
    },
  });

  const addPlayer = (values: PlayerFormValues) => {
    if (values.playerName.trim() === "") return;
    
    if (playerCount >= 16) {
      toast({
        title: "Максимален брой играчи",
        description: "Можете да добавите до 16 играча",
        variant: "destructive"
      });
      return;
    }
    
    onAddPlayer(values.playerName);
    form.reset();
    
    toast({
      title: "Играч добавен",
      description: `${values.playerName} беше добавен успешно`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Добави играчи ({playerCount}/16)</h3>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(addPlayer)} className="flex gap-3">
          <FormField
            control={form.control}
            name="playerName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input 
                    placeholder="Въведете име..." 
                    {...field}
                    className="bg-white/95 border-white/70 focus:border-purple-300 focus:ring-purple-200 rounded-xl"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            disabled={playerCount >= 16}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-md disabled:opacity-50"
          >
            <Plus className="mr-2 w-4 h-4" />
            Добави
          </Button>
        </form>
      </Form>
      
      {/* {playerCount === 0 && (
        <div className="text-center py-4">
          <Button 
            variant="outline" 
            onClick={generateDummyNames}
            className="bg-white/90 border-white/70 hover:bg-white/95 text-gray-700 rounded-xl"
          >
            <UserPlus className="mr-2 w-4 h-4" />
            Добави тестови играчи
          </Button>
        </div>
      )} */}
    </div>
  );
}
