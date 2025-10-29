import { AccountSettings } from '@stackframe/stack';
import { SettingsIcon, OptionIcon, MarsIcon } from 'lucide-react';
import Settings from './Settings'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


import React, { useState } from 'react';

const extraItems = [
    {
        id: 'custom',
        title: 'Custom Section',
        icon: <SettingsIcon />,
        content: <div className="p-4">This is a custom section content.</div>,
    },
    {
        id: 'another',
        title: 'Another Section',
        icon: <MarsIcon />,
        content: <Settings />,
    }
];

const MyAccount: React.FC = () => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Add your save logic here
        setIsSaving(false);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">My User Settings</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Account Settings</DialogTitle>
                        <DialogDescription>
                            Manage your account settings and preferences.
                        </DialogDescription>
                    </DialogHeader>
                    <AccountSettings
                        fullPage={true}
                        extraItems={extraItems}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MyAccount;
