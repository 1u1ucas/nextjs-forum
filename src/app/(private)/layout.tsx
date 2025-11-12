interface PrivateLayoutProps {
    children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {

    return (
        <div>
            {children}
        </div>
    );
}