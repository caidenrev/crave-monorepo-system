import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-sans",
          description: "group-[.toast]:opacity-90 text-[13px]",
          success:
            "!bg-success !text-success-foreground !border-none [&_svg]:!text-success-foreground [&_[data-icon]]:!text-success-foreground",
          error:
            "!bg-destructive !text-destructive-foreground !border-none [&_svg]:!text-destructive-foreground [&_[data-icon]]:!text-destructive-foreground",
          info: "!bg-primary !text-primary-foreground !border-none [&_svg]:!text-primary-foreground [&_[data-icon]]:!text-primary-foreground",
          warning:
            "!bg-warning !text-warning-foreground !border-none [&_svg]:!text-warning-foreground [&_[data-icon]]:!text-warning-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
