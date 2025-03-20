import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WalletButton from '@/components/ui/wallet-button';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  convertFileToBase64,
  copyToClipboard,
  formatNumber,
  getImageDimensions,
  removeFormatting,
} from '@/lib/utils';
import {
  CREATE_TOKEN_FEE,
  IMMUTABLE_FEE,
  MAX_LOGO_HEIGHT,
  MAX_LOGO_SIZE,
  MAX_LOGO_WIDTH,
  MAX_TAGS,
  RAYDIUM_LIQUIDITY_URL,
  REVOKE_FREEZE_FEE,
  REVOKE_MINT_FEE,
  TOKEN_NAME_MAX_CHARS,
  TOKEN_SYMBOL_MAX_CHARS,
} from '@/lib/constants/token';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenFormData } from '@/lib/validation/token';
import { DragAndDrop } from '@/components/ui/drag-and-drop';
import { TagsInput } from '@/components/ui/tags-input';
import {
  Shield,
  XCircle,
  PlusCircle,
  InfoIcon,
  Copy,
  Link as LinkIcon,
  AlignVerticalDistributeEnd,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ErrorResponseDto } from '@/lib/models';
import axios, { AxiosError } from 'axios';
import useConnection from '@/components/hook/token';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@radix-ui/react-dialog';
import Spinner from '@/components/ui/spinner';
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { deserializeTransaction } from '@/lib/utils/token';
import {
  CreateTokenResponseDto,
  AddSupplierResponseDto,
  ResizeImageResponseDto,
} from '@/lib/models/token';
import { getSumOfReferrals, updateWallet } from '@/lib/utils/wallet';
import { GetServerSideProps } from 'next';
import { WalletSendTransactionError } from '@solana/wallet-adapter-base';
import FrequentAnswersAndQuestions from '@/components/layout/frequent-answer-question';
import dotenv from 'dotenv';
import bs58 from 'bs58';

dotenv.config();

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

interface SSRCreateTokenPageProps {
  swapForgeSecret: string;
  network: string;
}

function CreateTokenPage({
  swapForgeSecret,
  network,
}: SSRCreateTokenPageProps) {
  const [schema, setSchema] = useState<
    typeof import('@/lib/validation/token').tokenFormSchema | null
  >(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<TokenFormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenDecimals: '6',
      tokenSupply: '',
      tokenDescription: '',
      tags: [],
      revokeMint: true,
      revokeFreeze: true,
      immutable: true,
      customCreatorInfo: false,
      creatorName: 'SwapForge',
      creatorWebsite: 'https://swagforge.app',
      createSocial: false,
      socialWebsite: '',
      socialTwitter: '',
      socialTelegram: '',
      socialDiscord: '',
      socialInstagram: '',
      socialFacebook: '',
      tokenFee: CREATE_TOKEN_FEE,
    },
    mode: 'onChange',
  });

  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection({ network });

  const tokenName = watch('tokenName');
  const tokenSymbol = watch('tokenSymbol');
  const tokenLogo = watch('tokenLogo');
  const tokenFee = watch('tokenFee');
  const revokeMint = watch('revokeMint');
  const revokeFreeze = watch('revokeFreeze');
  const immutable = watch('immutable');
  const customCreatorInfo = watch('customCreatorInfo');
  const createSocial = watch('createSocial');

  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [tokenImageHover, setTokenImageHover] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [solScanUrl, setSolscanUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const computedTotalFee = useMemo(() => {
    let totalFee = 0;
    if (revokeMint) {
      const sum = totalFee + REVOKE_MINT_FEE;
      totalFee = Number(sum.toFixed(2));
    }
    if (revokeFreeze) {
      const sum = totalFee + REVOKE_FREEZE_FEE;
      totalFee = Number(sum.toFixed(2));
    }
    if (immutable) {
      const sum = totalFee + IMMUTABLE_FEE;
      totalFee = Number(sum.toFixed(2));
    }
    const sum = totalFee + CREATE_TOKEN_FEE;
    let computedTotalFee = Number(sum.toFixed(2));
    if (discount > 0) {
      computedTotalFee = computedTotalFee - computedTotalFee * discount;
    }
    setValue('tokenFee', computedTotalFee);
    return computedTotalFee;
  }, [discount, immutable, revokeFreeze, revokeMint, setValue]);

  const onFileUpload = useCallback(
    async (file?: File) => {
      clearErrors('tokenLogo');
      if (!file) {
        setError('tokenLogo', {
          type: 'manual',
          message: 'Token logo is required',
        });
      } else if (file.size / 1024 > MAX_LOGO_SIZE) {
        setError('tokenLogo', {
          type: 'manual',
          message: `Size must be less than ${MAX_LOGO_SIZE}KB`,
        });
        return;
      } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('tokenLogo', {
          type: 'manual',
          message: 'Only JPEG and PNG images are allowed',
        });
      } else {
        const dimensions = await getImageDimensions(file);
        let tokenLogoBase64;
        const checkDimensionCondition =
          dimensions.width > MAX_LOGO_WIDTH ||
          dimensions.height > MAX_LOGO_HEIGHT;
        if (checkDimensionCondition) {
          tokenLogoBase64 = await convertFileToBase64(file);
          const resizeImageResponse = await axios.post<ResizeImageResponseDto>(
            '/api/token-resize-image',
            {
              tokenLogoBase64,
            }
          );
          const { resizedTokenLogoBase64 } = resizeImageResponse.data;
          setValue('tokenLogo', resizedTokenLogoBase64);
        } else {
          tokenLogoBase64 = await convertFileToBase64(file);
          setValue('tokenLogo', tokenLogoBase64);
        }
      }
    },
    [clearErrors, setError, setValue]
  );

  const onRemoveTokenLogo = useCallback(() => {
    const {
      tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenSupply,
      tokenDescription,
      tags,
      revokeMint,
      revokeFreeze,
      immutable,
      customCreatorInfo,
      creatorName,
      creatorWebsite,
      createSocial,
      socialWebsite,
      socialTwitter,
      socialTelegram,
      socialDiscord,
      socialInstagram,
      socialFacebook,
      tokenFee,
    } = getValues();
    reset({
      tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenSupply,
      tokenLogo: '',
      tokenDescription,
      tags,
      revokeMint,
      revokeFreeze,
      immutable,
      customCreatorInfo,
      creatorName,
      creatorWebsite,
      createSocial,
      socialWebsite,
      socialTwitter,
      socialTelegram,
      socialDiscord,
      socialInstagram,
      socialFacebook,
      tokenFee,
    });
  }, [getValues, reset]);

  const onSubmit = useCallback(
    async (tokenFormData: TokenFormData) => {
      try {
        setErrorMessage('');
        if (!connected || !publicKey) {
          toast.error('Please connect your wallet first.');
          return;
        }

        const walletBalance = await connection.getBalance(publicKey);

        if (walletBalance / LAMPORTS_PER_SOL < tokenFee) {
          toast.warn('Insufficient Balance!');
        }

        const swapForgeAuthority = Keypair.fromSecretKey(
          bs58.decode(swapForgeSecret)
        );

        updateWallet(publicKey.toBase58());

        setLoading(true);

        const mint = Keypair.generate();
        setToken(mint.publicKey.toBase58());

        const createTokenResponse = await axios.post<CreateTokenResponseDto>(
          '/api/token-create',
          {
            ...tokenFormData,
            swapForgePublicKey: swapForgeAuthority.publicKey,
            walletPublicKey: publicKey,
            mintPublicKey: mint.publicKey,
          }
        );

        const { serializedTransaction } = createTokenResponse.data;

        const transaction = deserializeTransaction(serializedTransaction);

        const signature = await sendTransaction(transaction, connection, {
          signers: [mint, swapForgeAuthority],
        });
        console.log('signature', signature);
        const signatureUrl = `https://solscan.io/tx/${signature}${
          network === 'devnet' ? '?cluster=devnet' : ''
        }`;
        setSolscanUrl(signatureUrl);

        const addSupplierResponse = await axios.post<AddSupplierResponseDto>(
          '/api/token-add-supplier',
          {
            tokenSupply: removeFormatting(tokenFormData.tokenSupply),
            revokeMint,
            revokeFreeze,
            immutable,
            swapForgePublicKey: swapForgeAuthority.publicKey,
            walletPublicKey: publicKey,
            mintPublicKey: mint.publicKey,
          }
        );
        const message = addSupplierResponse.data?.message;
        setLoading(false);
        if (!message.includes('Failed')) {
          setOpen(true);
          reset();
          toast.success('Your token has been created!');
        } else {
          toast.error(message);
        }
      } catch (error) {
        if (error instanceof WalletSendTransactionError) {
          if (error.message.includes('User rejected the request')) {
            toast.error('You rejected the transaction. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else if (error instanceof AxiosError) {
          const axiosError = error as AxiosError;
          const data = axiosError.response?.data;
          toast.error((data as ErrorResponseDto)?.error);
          setErrorMessage((data as ErrorResponseDto)?.error);
        } else {
          toast.error('Transaction failed. Please try again.');
        }
        setLoading(false);
      }
    },
    [
      connected,
      connection,
      immutable,
      network,
      publicKey,
      reset,
      revokeFreeze,
      revokeMint,
      sendTransaction,
      swapForgeSecret,
      tokenFee,
    ]
  );

  useEffect(() => {
    import('@/lib/validation/token').then((module) => {
      setSchema(module.tokenFormSchema);
    });
  }, []);

  useEffect(() => {
    getDiscount();
    return () => {};

    async function getDiscount() {
      if (publicKey) {
        const discount = (await getSumOfReferrals(publicKey.toBase58())) || 0;
        setDiscount(discount);
      }
    }
  }, [connection, publicKey]);

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header
        isLanding={false}
        title='Create Your Token'
        subtitle='Easily create and manage tokens on the Solana blockchain.'
      />

      <Navbar />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className='fixed inset-0 bg-black/50' />
          <DialogContent className='fixed left-[50%] top-[50%] w-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-900 p-6 shadow-lg'>
            <DialogHeader>
              <DialogTitle className='text-gray-300'>Token Created</DialogTitle>
              <DialogDescription className='text-gray-300'>
                Your token has been created successful!
              </DialogDescription>
            </DialogHeader>
            <div className='my-8 flex items-center space-x-2'>
              <div className='grid flex-1 gap-2'>
                <Label htmlFor='token' className='sr-only'>
                  Token
                </Label>
                <Input id='token' defaultValue={token} readOnly />
              </div>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard(token);
                  toast.success('Token copied!');
                }}
                size='sm'
                className='cursor-pointer px-3'
              >
                <span className='sr-only'>Copy</span>
                <Copy />
              </Button>
            </div>

            <div className='flex flex-col gap-4'>
              <div className='flex justify-center'>
                <Link
                  href={solScanUrl}
                  target='_blank'
                  className='cursor-pointer'
                >
                  <span className='text-xs flex items-center gap-1 text-yellow-400 underline'>
                    <LinkIcon className='h-4' /> View signature on solscan
                  </span>
                </Link>
              </div>

              <div className='flex justify-center'>
                <Link
                  href={RAYDIUM_LIQUIDITY_URL}
                  target='_blank'
                  className='cursor-pointer'
                >
                  <span className='text-xs flex items-center gap-1 text-yellow-400 underline'>
                    <AlignVerticalDistributeEnd className='h-4' /> Create
                    Liquidity Pool on Raydium
                  </span>
                </Link>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
                className='cursor-pointer'
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Wallet Connection Button */}
      <div className='absolute right-4 top-4'>
        <WalletButton />
      </div>

      {/* Token Creation Form */}
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 md:flex-row'>
        <div className='order-2 flex flex-col md:order-1 md:w-2/3'>
          <h1 className='mb-8 text-center text-4xl font-bold'>
            Create Your Token
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='border-1 flex flex-col rounded border-gray-500 p-3'
          >
            <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenName'>
                  Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  type='text'
                  id='tokenName'
                  {...register('tokenName')}
                  placeholder='Enter token name'
                />
                <div className='text-xs flex flex-row justify-between text-center italic'>
                  <span className='text-red-400'>
                    {errors.tokenName && <p>{errors.tokenName.message}</p>}
                  </span>
                  <span className='text-right'>
                    {tokenName?.length || 0}/{TOKEN_NAME_MAX_CHARS}
                  </span>
                </div>
              </div>

              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenSymbol'>
                  Symbol <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='tokenSymbol'
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) => {
                        const transformed = e.target.value.toUpperCase().trim();
                        field.onChange(transformed);
                      }}
                      className='placeholder:text-muted-foreground h-9 w-full rounded-lg bg-gray-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token symbol'
                    />
                  )}
                />
                <div className='text-xs flex flex-row justify-between text-center italic'>
                  <span className='text-red-400'>
                    {errors.tokenSymbol && <p>{errors.tokenSymbol.message}</p>}
                  </span>
                  <span className='text-right'>
                    {tokenSymbol?.length || 0}/{TOKEN_SYMBOL_MAX_CHARS}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenDecimals'>
                  Decimals <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='tokenDecimals'
                  control={control}
                  defaultValue='6'
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) => {
                        const formattedValue = formatNumber(e.target.value);
                        field.onChange(formattedValue);
                      }}
                      className='h-9 w-full rounded-lg bg-gray-700 p-3 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token decimals'
                    />
                  )}
                />
                {errors.tokenDecimals && (
                  <p className='text-xs text-left italic text-red-400'>
                    {errors.tokenDecimals.message}
                  </p>
                )}
              </div>

              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenSupply'>
                  Token Supply <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='tokenSupply'
                  control={control}
                  defaultValue='0'
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) => {
                        // Format the input value
                        const formattedValue = formatNumber(e.target.value);
                        // Update the field value
                        field.onChange(formattedValue);
                      }}
                      className='h-9 w-full rounded-lg bg-gray-700 p-3 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token symbol'
                    />
                  )}
                />
                {errors.tokenSupply && (
                  <p className='text-xs text-left italic text-red-400'>
                    {errors.tokenSupply.message}
                  </p>
                )}
              </div>
            </div>

            <div className='mt-3 flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-1/3 flex-col gap-1'>
                <Label htmlFor='tokenLogo'>
                  Token Logo <span className='text-red-500'>*</span>
                </Label>
                {tokenLogo ? (
                  <div
                    className='relative flex justify-start'
                    onMouseEnter={() => setTokenImageHover(true)}
                    onMouseLeave={() => setTokenImageHover(false)}
                  >
                    {tokenImageHover && (
                      <XCircle
                        onClick={onRemoveTokenLogo}
                        className='absolute right-4 top-1 h-4 w-4 cursor-pointer text-gray-400 hover:text-yellow-400'
                      />
                    )}
                    <Image
                      src={tokenLogo}
                      alt='tokenLogo'
                      width={200}
                      height={200}
                      className='rounded-md'
                    />
                  </div>
                ) : (
                  <DragAndDrop onFileUpload={onFileUpload} />
                )}
                {errors.tokenLogo && (
                  <p className='text-xs italic text-red-400'>
                    {errors.tokenLogo.message}
                  </p>
                )}
              </div>

              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenDescription'>
                  Token Description <span className='text-red-500'>*</span>
                </Label>
                <Textarea
                  id='message'
                  {...register('tokenDescription')}
                  className='h-40'
                  placeholder='Type your message here.'
                />
                <div className='text-xs flex flex-row justify-between text-center italic'>
                  <span className='text-red-400'>
                    {errors.tokenDescription && (
                      <p>{errors.tokenDescription.message}</p>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-3 flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenLogo'>
                  Token Tags (Max {MAX_TAGS - 1})
                </Label>
                <Controller
                  name='tags'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TagsInput
                        name={field.name}
                        value={field.value as string[]}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder='Type ENTER to save tags'
                        maxTags={MAX_TAGS}
                      />
                    </>
                  )}
                />
              </div>
            </div>

            <h2 className='mb-2 mt-3 flex items-center gap-2 text-xl text-gray-200'>
              <Shield className='h-8 w-8' /> Additional settings
            </h2>

            <div className='mb-6 flex w-full flex-col justify-between gap-2'>
              <div className='flex w-full flex-row items-center justify-between'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='revokeMint'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor='revokeMint'
                    className='text block font-medium'
                  >
                    Revoke Mint Authority
                  </Label>
                </div>
                {revokeMint && (
                  <span className='text-xs text-yellow-400'>
                    {REVOKE_MINT_FEE} SOL
                  </span>
                )}
              </div>

              {revokeMint && (
                <Alert>
                  <Shield className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Revoke right to mint new coins, this shows buyer of your
                    coin that supply is fixed and cannot grow. DEX scanners will
                    mark your coin as safe.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-2'>
              <div className='flex w-full flex-row items-center justify-between'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='revokeFreeze'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor='revokeFreeze'
                    className='text block font-medium'
                  >
                    Revoke Freeze Authority
                  </Label>
                </div>
                {revokeFreeze && (
                  <span className='text-xs text-yellow-400'>
                    {REVOKE_FREEZE_FEE} SOL
                  </span>
                )}
              </div>

              {revokeFreeze && (
                <Alert>
                  <Shield className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Revoke freeze right, you will make coin safer for potential
                    buyers of your coin and get more sales. DEX scanners will
                    mark your coin as safe.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-1'>
              <div className='flex w-full flex-row items-center justify-between gap-2'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='immutable'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor='immutable' className='text block font-medium'>
                    Revoke Update
                  </Label>
                </div>
                {immutable && (
                  <span className='text-xs text-yellow-400'>
                    {IMMUTABLE_FEE} SOL
                  </span>
                )}
              </div>

              {immutable && (
                <Alert>
                  <Shield className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    If your token is immutable it means you will not be able to
                    update token metadata
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-1'>
              <div className='flex w-full flex-row items-center justify-between gap-2'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='customCreatorInfo'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor='customCreatorInfo'>
                    Customize Creator Information
                  </Label>
                </div>
                {customCreatorInfo && (
                  <span className='text-xs text-yellow-400'>Free</span>
                )}
              </div>

              {customCreatorInfo && (
                <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                  <div className='flex w-full flex-col gap-1'>
                    <Label htmlFor='creatorName'>
                      Creator Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      type='text'
                      id='creatorName'
                      {...register('creatorName')}
                      placeholder='Customize creator name'
                    />
                    <div className='text-xs flex flex-row justify-between text-center italic'>
                      <span className='text-red-400'>
                        {errors.creatorName && (
                          <p>{errors.creatorName.message}</p>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className='flex w-full flex-col gap-1'>
                    <Label htmlFor='creatorWebsite'>
                      Creator Website <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      type='text'
                      id='creatorWebsite'
                      {...register('creatorWebsite')}
                      placeholder='Enter token symbol'
                    />
                    <div className='text-xs flex flex-row justify-between text-center italic'>
                      <span className='text-red-400'>
                        {errors.creatorWebsite && (
                          <p>{errors.creatorWebsite.message}</p>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {customCreatorInfo && (
                <Alert variant={'neutral'}>
                  <InfoIcon className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Information!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Personalize your token contract address by customizing the
                    beginning or end—stand out with a unique touch!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-1'>
              <div className='flex w-full flex-row items-center justify-between gap-2'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='createSocial'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor='createSocial'>Customize Token Social</Label>
                </div>
                {createSocial && (
                  <span className='text-xs text-yellow-400'>Free</span>
                )}
              </div>

              {createSocial && (
                <>
                  <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialWebsite'>Website</Label>
                      <Input
                        type='text'
                        id='socialWebsite'
                        {...register('socialWebsite')}
                        placeholder='https://www.mytoken.com'
                      />
                    </div>

                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialTwitter'>Twitter</Label>
                      <Input
                        type='text'
                        id='socialTwitter'
                        {...register('socialTwitter')}
                        placeholder='https://x.com/mytoken'
                      />
                    </div>
                  </div>

                  <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialTelegram'>Telegram</Label>
                      <Input
                        type='text'
                        id='socialTelegram'
                        {...register('socialTelegram')}
                        placeholder='https://t.me/mytoken'
                      />
                    </div>

                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialDiscord'>Discord</Label>
                      <Input
                        type='text'
                        id='socialDiscord'
                        {...register('socialDiscord')}
                        placeholder='https://discord.com/mytoken'
                      />
                    </div>
                  </div>

                  <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialInstagram'>Instagram</Label>
                      <Input
                        type='text'
                        id='socialInstagram'
                        {...register('socialInstagram')}
                        placeholder='https://t.me/mytoken'
                      />
                    </div>

                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialFacebook'>Facebook</Label>
                      <Input
                        type='text'
                        id='socialFacebook'
                        {...register('socialFacebook')}
                        placeholder='https://www.facebook.com/mytoken'
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {connected ? (
              <Button
                type='submit'
                disabled={loading}
                className='w-full cursor-pointer rounded-lg px-6 py-3 font-semibold transition duration-300'
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <PlusCircle className='mr-2 h-4 w-4' /> Create Token
                  </>
                )}
              </Button>
            ) : (
              <span className='flex w-full justify-center text-yellow-400'>
                Please connect your wallet! 
              </span>
            )}
          </form>
          {tokenFee && (
            <span className='text-xs mt-3 text-center italic text-yellow-400'>
              The cost of Token creation is {computedTotalFee} SOL, covering all
              fees {discount > 0 ? ` and including of ${discount}%` : ''}!.
            </span>
          )}
          {errorMessage && (
            <span className='text-xs mt-3 text-center italic text-red-500'>
              {errorMessage}
            </span>
          )}
        </div>
        <div className='order-1 flex flex-col gap-3 md:order-2 md:w-1/3'>
          <h2 className='mb-5 text-center text-4xl font-bold'>How to use?</h2>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 1</span>
            <span>Connect your Solana wallet</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 2</span>
            <span>Specify the desired name and symbol</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 3</span>
            <span>Select the decimals quantity</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 4</span>
            <span>Set the amount of suppliers</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 5</span>
            <span>Upload a 500x500 or less image</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 6</span>
            <span>Provide a brief description</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 7</span>
            <span>Add tags or keywords</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 8</span>
            <span>Click on Create Token</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 9</span>
            <span>Accept the transaction.</span>
          </div>
          <div className='border-1 flex justify-center gap-2 rounded border-gray-500 p-2 md:flex-row md:justify-start'>
            <span>Your token is ready 🚀🚀🚀</span>
          </div>
        </div>
      </div>

      <FrequentAnswersAndQuestions />

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  SSRCreateTokenPageProps
> = async () => {
  return {
    props: {
      swapForgeSecret: process.env.SWAPFORGE_WALLET_SECRET || '',
      network: process.env.SOLANA_NETWORK || '',
    },
  };
};

export default CreateTokenPage;
