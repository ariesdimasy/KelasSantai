import Badge from "./../../components/bagdes"
import Button from "../../components/buttons"

export default function Home(){
    return (<div>
           
        
            <main className="flex-1 overflow-auto p-6">
                <Button primary> Click Me </Button>
              <Button danger> Click Me if you want danger </Button>
              <Button> Click Me Not had Type </Button>

              <Badge new> New Badge </Badge>
              <Badge error> Error Boss </Badge>
            </main>
    </div>)
}