import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";

// Import the new app icons
import iconBlue from "../assets/new-icons/drop-icon-blue.svg";
import iconPurple from "../assets/new-icons/drop-icon-purple.svg";
import iconOrange from "../assets/new-icons/drop-icon-orange.svg";

export default function NewIconOptions() {
  const { themeColors } = useTheme();
  
  const appIcons = [
    { 
      id: 1, 
      src: iconBlue, 
      title: "Ocean Blue",
      description: "Clean, modern blue gradient with a crisp white droplet symbol - perfect for representing the app's reflective journaling purpose with a fresh, calming aesthetic." 
    },
    { 
      id: 2, 
      src: iconPurple, 
      title: "Royal Purple",
      description: "Rich purple gradient providing a sense of depth and introspection, ideal for a thoughtful journaling app that encourages deeper self-reflection."
    },
    { 
      id: 3, 
      src: iconOrange, 
      title: "Sunset Orange",
      description: "Warm, energetic orange gradient that conveys enthusiasm and emotional warmth - perfect for an app focused on emotional journaling and connection."
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-14 px-4 md:px-6">
          <h1 className="text-xl font-semibold">Drop App Icon Selection</h1>
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
                  <Button className="w-full">Select This Icon</Button>
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