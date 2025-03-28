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

// Import inspiration starburst icons
import iconInspiration1 from "../assets/icon-inspiration1.svg";
import iconInspiration2 from "../assets/icon-inspiration2.svg";
import iconInspiration3 from "../assets/icon-inspiration3.svg";

// Import hygge themed icons
import iconHygge1 from "../assets/icon-hygge1.svg";
import iconHygge2 from "../assets/icon-hygge2.svg";
import iconHygge3 from "../assets/icon-hygge3.svg";
import iconHygge4 from "../assets/icon-hygge4.svg";
import iconHygge5 from "../assets/icon-hygge5.svg";

// Import individual focus icons
import iconCozy1 from "../assets/icon-cozy1.svg";
import iconCozy2 from "../assets/icon-cozy2.svg";
import iconCozy3 from "../assets/icon-cozy3.svg";

// Import refined icons
import iconTeacupRefined from "../assets/icon-teacup-refined.svg";

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
  
  const inspirationIcons = [
    { id: 1, src: iconInspiration1, description: "Starburst radiating from central point with subtle speech bubble accent, representing moments of inspiration and connection" },
    { id: 2, src: iconInspiration2, description: "Journal with dynamic starburst of ideas emerging from its pages, symbolizing the journey from reflection to insight" },
    { id: 3, src: iconInspiration3, description: "Light bulb surrounded by an energetic starburst explosion of inspiration rays, capturing the 'aha' moment of self-discovery" }
  ];
  
  const hyggeIcons = [
    { id: 1, src: iconHygge1, description: "Cozy fireplace scene with a journal and warm drink, evoking feelings of comfort and introspection" },
    { id: 2, src: iconHygge2, description: "Simple circular design with intimate fireplace, journal, and cup within a warm atmosphere" },
    { id: 3, src: iconHygge3, description: "Open journal with fireplace scene and tea, representing reflection in a comfortable setting" },
    { id: 4, src: iconHygge4, description: "Journal centered amongst warm flames, creating a sense of calm reflection and warmth" },
    { id: 5, src: iconHygge5, description: "Window panes featuring a journal, fireplace glow, and tea cup - all elements of cozy journaling" }
  ];
  
  const cozyFocusIcons = [
    { id: 1, src: iconCozy1, description: "Detailed steaming teacup and saucer with delicate steam wisps, representing warmth, comfort, and moments of peaceful reflection" },
    { id: 2, src: iconCozy2, description: "Open journal with detailed lined pages and sketches, symbolizing the act of documenting thoughts and creative expression" },
    { id: 3, src: iconCozy3, description: "Crackling fireplace with vibrant, dancing flames and decorative mantel, capturing the essence of warmth and home comfort" }
  ];
  
  const refinedIcons = [
    { id: 1, src: iconTeacupRefined, description: "Modern, simplified teacup with tea bag and elegant steam wisps - inspired by clean UI design principles while maintaining warmth and coziness" }
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="original">Original Options</TabsTrigger>
              <TabsTrigger value="variations">Option 3 Variations</TabsTrigger>
              <TabsTrigger value="inspiration">Starburst Inspiration</TabsTrigger>
              <TabsTrigger value="hygge">Hygge Cozy</TabsTrigger>
              <TabsTrigger value="focus">Individual Focus</TabsTrigger>
              <TabsTrigger value="refined">Refined Icons</TabsTrigger>
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
            
            <TabsContent value="inspiration" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Starburst Inspiration Icons</h3>
                  <p className="text-sm text-muted-foreground">
                    These new icons focus on the concept of sparking inspiration and insights, using starburst patterns to convey moments of discovery and reflection.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {inspirationIcons.map((icon) => (
                    <Card key={icon.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Inspiration {icon.id}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center p-6 bg-muted/20 rounded-md">
                        <img 
                          src={icon.src} 
                          alt={`Inspiration Icon ${icon.id}`} 
                          className="w-48 h-48 object-contain"
                        />
                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-4 pt-4">
                        <CardDescription>{icon.description}</CardDescription>
                        <Button variant="outline" className="w-full">
                          Select Inspiration {icon.id}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Design Philosophy</h4>
                  <p className="text-sm mb-4">
                    These designs center around the starburst concept, symbolizing the moments of inspiration and insight that come from self-reflection and journaling. Each design captures a different aspect of this experience:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Inspiration 1:</strong> A clean, symmetrical starburst pattern that creates a sense of energy radiating outward from a central point, representing the ripple effect of self-discovery.</li>
                    <li><strong>Inspiration 2:</strong> Combines a journal with a dynamic burst of ideas, illustrating how journaling can lead to unexpected insights and creative breakthroughs.</li>
                    <li><strong>Inspiration 3:</strong> The classic light bulb moment, reimagined with an energetic starburst to capture that perfect 'aha!' moment when reflection leads to clarity.</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hygge" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Hygge Cozy Icons</h3>
                  <p className="text-sm text-muted-foreground">
                    These icons evoke the Danish concept of "hygge" - a feeling of coziness, comfort, and contentment, centered around a fireplace and journaling experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hyggeIcons.map((icon) => (
                    <Card key={icon.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Hygge {icon.id}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center p-6 bg-muted/20 rounded-md">
                        <img 
                          src={icon.src} 
                          alt={`Hygge Icon ${icon.id}`} 
                          className="w-48 h-48 object-contain"
                        />
                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-4 pt-4">
                        <CardDescription>{icon.description}</CardDescription>
                        <Button variant="outline" className="w-full">
                          Select Hygge {icon.id}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Design Philosophy</h4>
                  <p className="text-sm mb-4">
                    These designs embrace the concept of "hygge," the Danish art of creating warmth, connection, and wellbeing. Each icon features clean, modern, two-dimensional design elements that evoke comfort and introspection:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Common Elements:</strong> Warm fireplace flames, open journals/notebooks, and comforting beverages create a narrative of reflection in a cozy setting.</li>
                    <li><strong>Design Approach:</strong> Flat, modern aesthetics with clean lines and geometric shapes, avoiding drop shadows or 3D effects for a timeless, contemporary feel.</li>
                    <li><strong>Color Palette:</strong> Warm oranges and browns are balanced with cooler blue-grays to create visual harmony and evoke both warmth and calm.</li>
                    <li><strong>Emotional Response:</strong> These icons aim to trigger a visceral sense of comfort and introspection - the feeling of being wrapped in a blanket with a journal and warm drink by the fire.</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="focus" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Individual Focus Icons</h3>
                  <p className="text-sm text-muted-foreground">
                    These icons each focus on a single cozy element in detail, highlighting the teacup, journal, or fireplace as standalone symbols of comfort and reflection.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cozyFocusIcons.map((icon) => (
                    <Card key={icon.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Focus {icon.id}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center p-6 bg-muted/20 rounded-md">
                        <img 
                          src={icon.src} 
                          alt={`Focus Icon ${icon.id}`} 
                          className="w-48 h-48 object-contain"
                        />
                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-4 pt-4">
                        <CardDescription>{icon.description}</CardDescription>
                        <Button variant="outline" className="w-full">
                          Select Focus {icon.id}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Design Philosophy</h4>
                  <p className="text-sm mb-4">
                    These designs spotlight individual elements that represent different aspects of the cozy journaling experience. Each icon has been refined to stand alone while still conveying the core elements of comfort and reflection:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Focus 1: The Teacup</strong> - Symbolizes taking time for yourself, pausing for reflection, and creating a peaceful moment in your day. The delicate steam wisps represent the warmth and transient nature of our thoughts.</li>
                    <li><strong>Focus 2: The Journal</strong> - Represents the act of documenting thoughts and experiences. The combination of lined pages and sketches illustrates how journaling can be both structured reflection and creative expression.</li>
                    <li><strong>Focus 3: The Fireplace</strong> - Embodies warmth, comfort, and the creation of a safe space for vulnerability and introspection. The dancing flames symbolize the dynamic nature of our inner thoughts.</li>
                    <li><strong>Deliberate Simplicity:</strong> Each icon focuses on a single element rendered in clean, modern, two-dimensional style to maintain visual clarity and emotional resonance.</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="refined" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold">Refined App Icons</h3>
                  <p className="text-sm text-muted-foreground">
                    These refined icons are inspired by clean, modern UI design principles, emphasizing simplicity and clarity while maintaining warmth and user friendliness.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {refinedIcons.map((icon) => (
                    <Card key={icon.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Refined {icon.id}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center p-6 bg-muted/20 rounded-md">
                        <img 
                          src={icon.src} 
                          alt={`Refined Icon ${icon.id}`} 
                          className="w-48 h-48 object-contain"
                        />
                      </CardContent>
                      <CardFooter className="flex flex-col items-start gap-4 pt-4">
                        <CardDescription>{icon.description}</CardDescription>
                        <Button variant="outline" className="w-full">
                          Select Refined {icon.id}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Design Approach</h4>
                  <p className="text-sm mb-4">
                    This refined icon set embraces modern app design principles while maintaining the warmth and coziness of our journaling application:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Clean Lines:</strong> Simplified shapes with clear outlines create immediately recognizable, scalable elements that work well at various sizes.</li>
                    <li><strong>Considered Color:</strong> Deeper, richer colors create better contrast and visibility while maintaining a warm, inviting palette.</li>
                    <li><strong>Distinctive Details:</strong> The tea bag element adds a unique, memorable detail that helps the icon stand out while reinforcing the coziness theme.</li>
                    <li><strong>Balanced Simplicity:</strong> Elements are reduced to their most distinctive forms while maintaining enough detail to convey warmth and comfort.</li>
                    <li><strong>Mobile-Optimized:</strong> The icon is designed with mobile app home screens in mind, with strong silhouettes that remain clear at smaller sizes.</li>
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