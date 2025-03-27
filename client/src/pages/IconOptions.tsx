import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";

// Import all icons
import iconOption1 from "../assets/icon-option1.svg";
import iconOption2 from "../assets/icon-option2.svg";
import iconOption3 from "../assets/icon-option3.svg";
import iconOption4 from "../assets/icon-option4.svg";
import iconOption5 from "../assets/icon-option5.svg";

export default function IconOptions() {
  const { themeColors } = useTheme();

  const iconOptions = [
    { id: 1, src: iconOption1, description: "Simple droplet with warm orange/brown tones" },
    { id: 2, src: iconOption2, description: "Heart-shaped container with droplet inside" },
    { id: 3, src: iconOption3, description: "Speech bubble with droplet, representing conversations and reflection" },
    { id: 4, src: iconOption4, description: "Multiple droplets in a circular container, showing different moods/stages" },
    { id: 5, src: iconOption5, description: "Open journal/book with droplet, representing journaling and reflection" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-14 px-4 md:px-6">
          <h1 className="text-xl font-semibold">Drop App Icon Options</h1>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="grid gap-6 md:gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-foreground">
              Icon Options for Drop
            </h2>
            <p className="text-muted-foreground">
              Please select your preferred icon design from the options below. Each icon has been crafted to convey a sense of dropping into intimacy with feelings of warmth and connection, while maintaining a simple, modern, and clean aesthetic.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {iconOptions.map((icon) => (
              <Card key={icon.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>Option {icon.id}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-6 bg-muted/20 rounded-md">
                  <img 
                    src={icon.src} 
                    alt={`Icon Option ${icon.id}`} 
                    className="w-40 h-40 object-contain"
                  />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4 pt-4">
                  <CardDescription>{icon.description}</CardDescription>
                  <Button variant="outline" className="w-full">
                    Select Option {icon.id}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}