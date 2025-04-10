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
} from '@/libs/utils';
import {
  CREATE_TOKEN_FEE,
  MAX_LOGO_HEIGHT,
  MAX_LOGO_SIZE,
  MAX_LOGO_WIDTH,
  MAX_TAGS,
  RAYDIUM_LIQUIDITY_URL,
  TOKEN_NAME_MAX_CHARS,
  TOKEN_SYMBOL_MAX_CHARS,
} from '@/libs/constants/create-token';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateTokenFormData } from '@/libs/validation/create-token';
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
import { ErrorResponseDto } from '@/libs/models';
import axios, { AxiosError } from 'axios';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@radix-ui/react-dialog';
import Spinner from '@/components/ui/spinner';
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import {
  ResizeImageResponseDto,
  StoreTokenMetadaResponseDto,
} from '@/libs/models/token';
import { GetServerSideProps } from 'next';
import { WalletSendTransactionError } from '@solana/wallet-adapter-base';
import { database } from '@/libs/mongodb';
import { WALLET_COLLECTION, WalletDto } from '@/libs/models/wallet';
import { updateWallet } from '@/libs/utils/wallet';
import FrequentAnswersAndQuestions from '@/components/layout/frequent-answer-question';
import dotenv from 'dotenv';
import { createTokenFromContract, getProvider } from '@/components/services/blockchain';
import { BN } from '@coral-xyz/anchor';

dotenv.config();

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

interface SSRCreateTokenPageProps {
  referralCode: string;
}

function CreateTokenPage({
  referralCode,
}: SSRCreateTokenPageProps) {
  const [schema, setSchema] = useState<
    typeof import('@/libs/validation/create-token').createTokenFormSchema | null
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
  } = useForm<CreateTokenFormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenDecimals: '9',
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

  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();

  const tokenName = watch('tokenName');
  const tokenSymbol = watch('tokenSymbol');
  const tokenFee = watch('tokenFee');
  const tokenLogo = watch('tokenLogo');
  const revokeMint = watch('revokeMint');
  const revokeFreeze = watch('revokeFreeze');
  const immutable = watch('immutable');
  const customCreatorInfo = watch('customCreatorInfo');
  const createSocial = watch('createSocial');

  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(
    'Creating your token, please be patient!'
  );
  const [signature, setSignature] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);
  const [tokenImageHover, setTokenImageHover] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const program = useMemo(() => getProvider(
    publicKey!,
    sendTransaction!,
    signTransaction!),
  [publicKey, sendTransaction, signTransaction])

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
            '/api/token/image/resize',
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
    async (createTokenFormData: CreateTokenFormData) => {
      try {
        setErrorMessage('');
        if (!connected || !publicKey) {
          toast.error('Please connect your wallet first.');
          return;
        }

        if (!program) {
          toast.error('No program initialized');
          return;
        }

        setTitle('Creating your token, please be patient!');
        setSignature('');
        setToken('');
        setLoading(true);
        setOpen(true);

        const storeTokenMetadataResponse = await axios.post<StoreTokenMetadaResponseDto>(
          '/api/token/metadata/create',
          createTokenFormData
        );
        const { uri } = storeTokenMetadataResponse.data;

        setTitle('Creating your token, please be patient!');
        setSignature('');
        setToken('');
        setLoading(true);
        setOpen(true);
        setLoading(true);
        setOpen(true);

        const {
          tokenName,
          tokenSymbol,
          tokenDecimals,
          tokenSupply,
          revokeMint,
          revokeFreeze,
          immutable
        } = createTokenFormData;

        const {tx, mint} = await createTokenFromContract(
          program,
          publicKey,
          tokenName,
          tokenSymbol,
          Number(tokenDecimals),
          new BN(tokenSupply),
          uri,
          revokeMint,
          revokeFreeze,
          immutable
        )

        if (!tx) {
          toast.error('Create token failed!');
          throw Error('Create token failed!');
        }
        const signature = `https://solscan.io/tx/${tx}`;
        setSignature(signature);
        setToken(mint);
        updateWallet(publicKey.toBase58(), mint);
        reset();
        toast.success('Your token has been created!');
        setTitle('Successful');
        setLoading(false)
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
        setOpen(false)
        setLoading(false);
      }
    },
    [connected, program, publicKey, reset]
  );

  useEffect(() => {
    import('@/libs/validation/create-token').then((module) => {
      setSchema(module.createTokenFormSchema);
    });
  }, []);

  return (
    <div className='min-h-screen text-white bg-gray-900'>
      <Header
        isLanding={false}
        title='Create Your Token'
        subtitle='Easily create and manage tokens on the Solana blockchain.'
      />

      <Navbar />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className='fixed inset-0 bg-black/50' />
          <DialogContent
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
            className='fixed left-[50%] top-[50%] w-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-900 p-6 shadow-lg'
          >
            <DialogHeader>
              <DialogTitle className='text-gray-300'>{title}</DialogTitle>
            </DialogHeader>
            {token && (
              <div className='flex items-center my-8 space-x-2'>
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
                  className='px-3 cursor-pointer'
                >
                  <span className='sr-only'>Copy</span>
                  <Copy />
                </Button>
              </div>
            )}

            <div className='flex flex-col gap-4'>
              {signature && (
                <div className='flex justify-center'>
                  <Link
                    href={signature || ''}
                    target='_blank'
                    className='cursor-pointer'
                  >
                    <span className='flex items-center gap-1 text-xs text-yellow-400 underline'>
                      <LinkIcon className='h-4' /> View create token signature
                      on Solscan
                    </span>
                  </Link>
                </div>
              )}

              {token && (
                <div className='flex justify-center'>
                  <Link
                    href={RAYDIUM_LIQUIDITY_URL}
                    target='_blank'
                    className='cursor-pointer'
                  >
                    <span className='flex items-center gap-1 text-xs text-yellow-400 underline'>
                      <AlignVerticalDistributeEnd className='h-4' /> Create
                      Liquidity Pool on Raydium
                    </span>
                  </Link>
                </div>
              )}
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
      <div className='flex flex-col max-w-6xl gap-6 px-4 py-20 mx-auto md:flex-row'>
        <div className='flex flex-col order-2 md:order-1 md:w-2/3'>
          <h1 className='mb-8 text-4xl font-bold text-center'>
            Create Your Token
          </h1>
          <span className='flex flex-row justify-center gap-1 mb-2 text-sm'>
            <span>Referral Code</span>
            <span className='text-yellow-400'>{referralCode}</span>
          </span>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col p-3 border-gray-500 rounded border-1'
          >
            <div className='flex flex-col justify-between w-full gap-3 md:flex-row'>
              <div className='flex flex-col w-full gap-1'>
                <Label htmlFor='tokenName'>
                  Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  type='text'
                  id='tokenName'
                  {...register('tokenName')}
                  placeholder='Enter token name'
                />
                <div className='flex flex-row justify-between text-xs italic text-center'>
                  <span className='text-red-400'>
                    {errors.tokenName && <p>{errors.tokenName.message}</p>}
                  </span>
                  <span className='text-right'>
                    {tokenName?.length || 0}/{TOKEN_NAME_MAX_CHARS}
                  </span>
                </div>
              </div>

              <div className='flex flex-col w-full gap-1'>
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
                      className='w-full p-3 text-sm bg-gray-700 rounded-lg placeholder:text-muted-foreground h-9 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token symbol'
                    />
                  )}
                />
                <div className='flex flex-row justify-between text-xs italic text-center'>
                  <span className='text-red-400'>
                    {errors.tokenSymbol && <p>{errors.tokenSymbol.message}</p>}
                  </span>
                  <span className='text-right'>
                    {tokenSymbol?.length || 0}/{TOKEN_SYMBOL_MAX_CHARS}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col justify-between w-full gap-3 md:flex-row'>
              <div className='flex flex-col w-full gap-1'>
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
                      className='w-full p-3 text-right bg-gray-700 rounded-lg h-9 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token decimals'
                    />
                  )}
                />
                {errors.tokenDecimals && (
                  <p className='text-xs italic text-left text-red-400'>
                    {errors.tokenDecimals.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col w-full gap-1'>
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
                      className='w-full p-3 text-right bg-gray-700 rounded-lg h-9 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token symbol'
                    />
                  )}
                />
                {errors.tokenSupply && (
                  <p className='text-xs italic text-left text-red-400'>
                    {errors.tokenSupply.message}
                  </p>
                )}
              </div>
            </div>

            <div className='flex flex-col justify-between w-full gap-3 mt-3 md:flex-row'>
              <div className='flex flex-col w-1/3 gap-1'>
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
                        className='absolute w-4 h-4 text-gray-400 cursor-pointer right-4 top-1 hover:text-yellow-400'
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

              <div className='flex flex-col w-full gap-1'>
                <Label htmlFor='tokenDescription'>
                  Token Description <span className='text-red-500'>*</span>
                </Label>
                <Textarea
                  id='message'
                  {...register('tokenDescription')}
                  className='h-40'
                  placeholder='Type your message here.'
                />
                <div className='flex flex-row justify-between text-xs italic text-center'>
                  <span className='text-red-400'>
                    {errors.tokenDescription && (
                      <p>{errors.tokenDescription.message}</p>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col justify-between w-full gap-3 mt-3 md:flex-row'>
              <div className='flex flex-col w-full gap-1'>
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

            <h2 className='flex items-center gap-2 mt-3 mb-2 text-xl text-gray-200'>
              <Shield className='w-8 h-8' /> Additional settings
            </h2>

            <div className='flex flex-col justify-between w-full gap-2 mb-6'>
              <div className='flex flex-row items-center justify-between w-full'>
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
                    className='block font-medium text'
                  >
                    Revoke Mint Authority
                  </Label>
                </div>
                {revokeMint && (
                  <span className='text-xs text-yellow-400'>
                    Free
                  </span>
                )}
              </div>

              {revokeMint && (
                <Alert>
                  <Shield className='w-4 h-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Revoke right to mint new coins, this shows buyer of your
                    coin that supply is fixed and cannot grow. DEX scanners will
                    mark your coin as safe.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='flex flex-col justify-between w-full gap-2 mb-6'>
              <div className='flex flex-row items-center justify-between w-full'>
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
                    className='block font-medium text'
                  >
                    Revoke Freeze Authority
                  </Label>
                </div>
                {revokeFreeze && (
                  <span className='text-xs text-yellow-400'>
                    Free
                  </span>
                )}
              </div>

              {revokeFreeze && (
                <Alert>
                  <Shield className='w-4 h-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Revoke freeze right, you will make coin safer for potential
                    buyers of your coin and get more sales. DEX scanners will
                    mark your coin as safe.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='flex flex-col justify-between w-full gap-1 mb-6'>
              <div className='flex flex-row items-center justify-between w-full gap-2'>
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
                  <Label htmlFor='immutable' className='block font-medium text'>
                    Revoke Update
                  </Label>
                </div>
                {immutable && (
                  <span className='text-xs text-yellow-400'>
                    Free
                  </span>
                )}
              </div>

              {immutable && (
                <Alert>
                  <Shield className='w-4 h-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    If your token is immutable it means you will not be able to
                    update token metadata
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='flex flex-col justify-between w-full gap-1 mb-6'>
              <div className='flex flex-row items-center justify-between w-full gap-2'>
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
                <div className='flex flex-col justify-between w-full gap-3 md:flex-row'>
                  <div className='flex flex-col w-full gap-1'>
                    <Label htmlFor='creatorName'>
                      Creator Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      type='text'
                      id='creatorName'
                      {...register('creatorName')}
                      placeholder='Customize creator name'
                    />
                    <div className='flex flex-row justify-between text-xs italic text-center'>
                      <span className='text-red-400'>
                        {errors.creatorName && (
                          <p>{errors.creatorName.message}</p>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-col w-full gap-1'>
                    <Label htmlFor='creatorWebsite'>
                      Creator Website <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      type='text'
                      id='creatorWebsite'
                      {...register('creatorWebsite')}
                      placeholder='Enter token symbol'
                    />
                    <div className='flex flex-row justify-between text-xs italic text-center'>
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
                  <InfoIcon className='w-4 h-4' />
                  <AlertTitle className='text-xs'>Information!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Personalize your token contract address by customizing the
                    beginning or end—stand out with a unique touch!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='flex flex-col justify-between w-full gap-1 mb-6'>
              <div className='flex flex-row items-center justify-between w-full gap-2'>
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
                  <div className='flex flex-col justify-between w-full gap-3 md:flex-row'>
                    <div className='flex flex-col w-full gap-1'>
                      <Label htmlFor='socialWebsite'>Website</Label>
                      <Input
                        type='text'
                        id='socialWebsite'
                        {...register('socialWebsite')}
                        placeholder='https://www.mytoken.com'
                      />
                    </div>

                    <div className='flex flex-col w-full gap-1'>
                      <Label htmlFor='socialTwitter'>Twitter</Label>
                      <Input
                        type='text'
                        id='socialTwitter'
                        {...register('socialTwitter')}
                        placeholder='https://x.com/mytoken'
                      />
                    </div>
                  </div>

                  <div className='flex flex-col justify-between w-full gap-3 md:flex-row'>
                    <div className='flex flex-col w-full gap-1'>
                      <Label htmlFor='socialTelegram'>Telegram</Label>
                      <Input
                        type='text'
                        id='socialTelegram'
                        {...register('socialTelegram')}
                        placeholder='https://t.me/mytoken'
                      />
                    </div>

                    <div className='flex flex-col w-full gap-1'>
                      <Label htmlFor='socialDiscord'>Discord</Label>
                      <Input
                        type='text'
                        id='socialDiscord'
                        {...register('socialDiscord')}
                        placeholder='https://discord.com/mytoken'
                      />
                    </div>
                  </div>

                  <div className='flex flex-col justify-between w-full gap-3 md:flex-row'>
                    <div className='flex flex-col w-full gap-1'>
                      <Label htmlFor='socialInstagram'>Instagram</Label>
                      <Input
                        type='text'
                        id='socialInstagram'
                        {...register('socialInstagram')}
                        placeholder='https://t.me/mytoken'
                      />
                    </div>

                    <div className='flex flex-col w-full gap-1'>
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
                className='w-full px-6 py-3 font-semibold transition duration-300 rounded-lg cursor-pointer'
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <PlusCircle className='w-4 h-4 mr-2' /> Create Token
                  </>
                )}
              </Button>
            ) : (
              <span className='flex justify-center w-full text-yellow-400'>
                Please connect your wallet! 
              </span>
            )}
          </form>
          <span className='mt-3 text-xs italic text-center text-yellow-400'>
            The cost of Token creation is {tokenFee} SOL, covering all fees!.
          </span>
          {errorMessage && (
            <span className='mt-3 text-xs italic text-center text-red-500'>
              {errorMessage}
            </span>
          )}
        </div>
        <div className='flex flex-col order-1 gap-3 md:order-2 md:w-1/3'>
          <h2 className='mb-5 text-4xl font-bold text-center'>How to use?</h2>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 1</span>
            <span>Connect your Solana wallet</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 2</span>
            <span>Specify the desired name and symbol</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 3</span>
            <span>Select the decimals quantity</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 4</span>
            <span>Set the amount of suppliers</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 5</span>
            <span>Upload a 500x500 or less image</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 6</span>
            <span>Provide a brief description</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 7</span>
            <span>Add tags or keywords</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 8</span>
            <span>Click on Create Token</span>
          </div>
          <div className='flex flex-col gap-2 p-2 border-gray-500 rounded border-1 md:flex-row'>
            <span className='text-yellow-400'>Step 9</span>
            <span>Accept the transaction.</span>
          </div>
          <div className='flex justify-center gap-2 p-2 border-gray-500 rounded border-1 md:flex-row md:justify-start'>
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
> = async (context) => {
  const referralCode = context.query?.referralCode as string;
  if (!referralCode) {
    return {
      redirect: {
        permanent: false,
        destination: '/create-token',
      },
      props: {},
    };
  }

  const wallet = await database
    .collection<WalletDto>(WALLET_COLLECTION)
    .findOne({
      referralCode,
    });

  if (!wallet?._id) {
    return {
      redirect: {
        permanent: false,
        destination: '/create-token',
      },
      props: {},
    };
  }

  return {
    props: {
      referralCode,
    },
  };
};

export default CreateTokenPage;
