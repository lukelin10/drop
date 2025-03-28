import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Import the new app icons
import iconCozy from "../assets/new-icons/drop-icon-cozy.svg";
import iconMidnight from "../assets/new-icons/drop-icon-midnight.svg";
import iconSunset from "../assets/new-icons/drop-icon-sunset.svg";

export default function NewIconOptions() {
  const { themeColors, activeTheme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const appIcons = [
    { 
      id: 1, 
      src: iconCozy,
      theme: "cozy",
      title: "Cozy Terracotta",
      description: "Warm terracotta gradient paired with sage green, featuring a crisp white droplet symbol - creates a cozy, inviting aesthetic that feels like home." 
    },
    { 
      id: 2, 
      src: iconMidnight,
      theme: "midnight",
      title: "Midnight Periwinkle",
      description: "Rich periwinkle blue with mauve gradient providing a sense of depth and introspection, ideal for thoughtful journaling in low light conditions."
    },
    { 
      id: 3, 
      src: iconSunset,
      theme: "sunset",
      title: "Sunset Orange",
      description: "Warm, energetic orange gradient that conveys enthusiasm and emotional warmth - perfect for an app focused on emotional journaling and connection."
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Back to Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Drop App Icon Selection</h1>
          </div>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Choose Your App Icon</h2>
            <p className="text-muted-foreground">
              Select from these professionally designed app icons that follow modern mobile design principles.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {appIcons.map((icon) => (
              <Card key={icon.id} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>{icon.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex items-center justify-center p-8 bg-muted/20 rounded-md">
                  <img 
                    src={icon.src} 
                    alt={`${icon.title} icon`} 
                    className="w-48 h-48 object-contain rounded-[28px] shadow-lg"
                  />
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4 pt-4">
                  <CardDescription className="text-sm">{icon.description}</CardDescription>
                  <Button 
                    className="w-full"
                    variant={activeTheme === icon.theme ? "default" : "outline"}
                    onClick={() => {
                      setTheme(icon.theme as any);
                      toast({
                        title: `${icon.title} Selected!`,
                        description: `App icon and theme color scheme updated to match ${icon.title}.`,
                      });
                    }}
                  >
                    {activeTheme === icon.theme ? "Currently Selected" : "Select This Icon"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-4">About Our Icon Design</h3>
            <p className="text-sm mb-4">
              These icons were created following industry-standard mobile app design principles, inspired by successful apps like Instagram, Facebook, and TikTok.
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2 text-sm">Design Principles</h4>
                <ul className="space-y-1 text-xs list-disc list-inside text-muted-foreground">
                  <li>Bold, simple silhouette with minimal detail</li>
                  <li>Strong color contrast using brand gradients</li>
                  <li>Rounded square format (squircle) for iOS/Android</li>
                  <li>Single focal element (droplet)</li>
                  <li>Solid gradient background following platform conventions</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-sm">Technical Specifications</h4>
                <ul className="space-y-1 text-xs list-disc list-inside text-muted-foreground">
                  <li>Optimized for multiple sizes (16px to 1024px)</li>
                  <li>Follows Apple Human Interface and Material Design guidelines</li>
                  <li>Scalable vector format for crisp rendering</li>
                  <li>Proper padding and visual weight</li>
                  <li>Works well in light and dark environments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}