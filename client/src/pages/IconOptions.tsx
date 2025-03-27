import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all icons
import iconOption1 from "../assets/icon-option1.svg";
import iconOption2 from "../assets/icon-option2.svg";
import iconOption3 from "../assets/icon-option3.svg";
import iconOption4 from "../assets/icon-option4.svg";
import iconOption5 from "../assets/icon-option5.svg";

// Import option 3 variations
import iconOption3a from "../assets/icon-option3a.svg";
import iconOption3b from "../assets/icon-option3b.svg";
import iconOption3c from "../assets/icon-option3c.svg";
import iconOption3d from "../assets/icon-option3d.svg";
import iconOption3e from "../assets/icon-option3e.svg";

export default function IconOptions() {
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState("original");

  const originalIconOptions = [
    { id: 1, src: iconOption1, description: "Simple droplet with warm orange/brown tones" },
    { id: 2, src: iconOption2, description: "Heart-shaped container with droplet inside" },
    { id: 3, src: iconOption3, description: "Speech bubble with droplet, representing conversations and reflection" },
    { id: 4, src: iconOption4, description: "Multiple droplets in a circular container, showing different moods/stages" },
    { id: 5, src: iconOption5, description: "Open journal/book with droplet, representing journaling and reflection" }
  ];
  
  const option3Variations = [
    { id: "3a", src: iconOption3a, description: "Enhanced speech bubble with rounder form and accent droplet for better emotional connection" },
    { id: "3b", src: iconOption3b, description: "Abstract concept with multiple droplets forming a connected pattern within a geometric bubble" },
    { id: "3c", src: iconOption3c, description: "Minimalist approach with clean lines, subtle ripple effects, and focused central droplet" },
    { id: "3d", src: iconOption3d, description: "Layered design with overlapping elements creating depth and sophisticated visual hierarchy" },
    { id: "3e", src: iconOption3e, description: "Modern rounded square speech bubble with textured droplet and dynamic line elements" }
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
              Each icon has been crafted to convey a sense of dropping into intimacy with feelings of warmth and connection, while maintaining a simple, modern, and clean aesthetic.
            </p>
          </div>
          
          <Tabs defaultValue="original" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original Options</TabsTrigger>
              <TabsTrigger value="variations">Option 3 Variations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="original" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Original Icon Concepts</h3>
                  <p className="text-sm text-muted-foreground">
                    These are the initial icon concepts developed for the Drop app.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {originalIconOptions.map((icon) => (
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
            </TabsContent>
            
            <TabsContent value="variations" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Refined Variations of Option 3</h3>
                  <p className="text-sm text-muted-foreground">
                    These iterations build upon the speech bubble with droplet concept, ranging from more abstract to clean, modern designs.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {option3Variations.map((icon) => (
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
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Design Review Notes</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Option 3a:</strong> Enhances emotional connection through softer forms while maintaining the conversational aspect.</li>
                    <li><strong>Option 3b:</strong> Explores connectivity between droplets, symbolizing how emotions and reflections connect.</li>
                    <li><strong>Option 3c:</strong> Takes a minimalist approach focusing on intentional simplicity and meaningful details.</li>
                    <li><strong>Option 3d:</strong> Creates visual interest through layering and depth, representing the layers of self-reflection.</li>
                    <li><strong>Option 3e:</strong> Balances modern design principles with organic elements for a contemporary feel.</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}